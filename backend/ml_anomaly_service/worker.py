"""
AuraTrace ML Anomaly Worker.

Flow:
  1. Consume events from Redis Stream (telemetry_stream)
  2. Persist raw event to telemetry_events table
  3. For crashes/errors → extract rolling features → score with Isolation Forest
  4. If anomalous/crash → create or update incident in PostgreSQL
  5. Push incident to diagnose stream (for RAG service) and pubsub (for WebSockets)
"""
import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone

import redis.asyncio as aioredis

try:
    from backend.shared.config import get_settings
    from backend.shared.database import get_db_pool
    from backend.shared.sanitizer import error_signature
    from backend.ml_anomaly_service.model import AnomalyDetector, severity_from_score
    from backend.ml_anomaly_service.feature_extractor import extract_window_features
except (ImportError, ModuleNotFoundError):
    from shared.config import get_settings
    from shared.database import get_db_pool
    from shared.sanitizer import error_signature
    from ml_anomaly_service.model import AnomalyDetector, severity_from_score
    from ml_anomaly_service.feature_extractor import extract_window_features

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] ml-worker: %(message)s",
)
log = logging.getLogger("ml-worker")

settings = get_settings()
detector = AnomalyDetector()


async def handle_event(r: aioredis.Redis, data: dict):
    """Process a single telemetry event."""
    try:
        raw_payload = data.get("payload")
        if isinstance(raw_payload, str):
            try:
                payload = json.loads(raw_payload)
            except Exception:
                payload = {"message": raw_payload}
        elif isinstance(raw_payload, dict):
            payload = raw_payload
        else:
            payload = {}

        project_id = str(data.get("project_id") or payload.get("project_id") or "00000000-0000-0000-0000-000000000001")
        event_type = str(data.get("event_type") or payload.get("event_type") or "error").lower()
        service_name = str(data.get("service_name") or payload.get("service_name") or payload.get("service_id") or "unknown")
        environment = str(data.get("environment") or payload.get("environment") or "production")
        
        signature = data.get("signature") or payload.get("signature")
        if not signature:
            err_type = str(payload.get("error_type") or "UnknownError")
            err_msg = str(payload.get("error_message") or payload.get("message") or "")
            st_trace = str(payload.get("stack_trace") or payload.get("raw_stack_trace") or "")
            signature = error_signature(err_type, err_msg, st_trace)

        pool = await get_db_pool()

        # ── 1. Persist raw event to telemetry_events ──────────────
        try:
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO telemetry_events
                        (project_id, event_type, runtime, payload, received_at)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                    """,
                    uuid.UUID(project_id) if len(project_id) == 36 else None,
                    event_type,
                    json.dumps(payload.get("runtime") or {}),
                    json.dumps(payload),
                )
        except Exception as e:
            log.warning("Raw telemetry_events insert warning: %s", e)

        # ── 2. Filter: only process errors / crashes ──────────────
        is_error_type = event_type in ("crash", "error", "exception", "fatal", "critical") or bool(payload.get("error_type"))
        if not is_error_type and float(payload.get("latency_ms") or 0.0) < 2000:
            return

        # ── 3. Feature extraction & Anomaly Scoring ───────────────
        window_seconds = getattr(settings, "WINDOW_SECONDS", 60) or 60
        features = await extract_window_features(project_id, service_name, window_seconds)
        
        # Merge immediate latency metric
        if payload.get("latency_ms"):
            lat = float(payload["latency_ms"])
            features["max_latency"] = max(features.get("max_latency", 0.0), lat)
            features["avg_latency"] = (features.get("avg_latency", lat) + lat) / 2.0

        score, is_anomaly = detector.score(features)

        log.info(
            "Scored %s/%s → score=%.3f anomaly=%s (events=%d)",
            project_id[:8], service_name, score, is_anomaly,
            int(features.get("event_count", 1)),
        )

        # ── 4. Decide: create or update incident ──────────────────
        should_create = (
            event_type in ("crash", "fatal", "critical")
            or is_anomaly
            or score >= 0.50
            or bool(payload.get("error_type"))
        )
        if not should_create:
            return

        severity = severity_from_score(score)
        error_type_val = str(payload.get("error_type") or "RuntimeError")
        error_msg_val = str(payload.get("error_message") or payload.get("message") or "")
        stack_trace_val = str(payload.get("stack_trace") or payload.get("raw_stack_trace") or "")

        # ── 5. Deduplicate by signature within active window ──────
        existing = None
        try:
            async with pool.acquire() as conn:
                existing = await conn.fetchrow(
                    """
                    SELECT id, COALESCE(event_count, 1) as event_count, COALESCE(anomaly_score, 0) as anomaly_score
                    FROM incidents
                    WHERE project_id::text = $1
                      AND error_signature = $2
                      AND status NOT IN ('resolved', 'RESOLVED', 'ignored')
                      AND created_at > NOW() - INTERVAL '1 hour'
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    str(project_id), signature,
                )
        except Exception:
            pass

        if existing:
            # Update existing incident
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE incidents
                    SET event_count = COALESCE(event_count, 1) + 1,
                        last_seen = CURRENT_TIMESTAMP,
                        anomaly_score = GREATEST(COALESCE(anomaly_score, 0), $1)
                    WHERE id = $2
                    """,
                    score, existing["id"],
                )
            log.info("📈 Updated incident %s (count=%d)", existing["id"], existing["event_count"] + 1)
            incident_id = str(existing["id"])
        else:
            # Create new incident
            new_id = uuid.uuid4()
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO incidents
                        (id, project_id, error_type, error_message, root_cause, stack_trace,
                         error_signature, runtime, environment, service_name,
                         anomaly_score, severity, status, created_at, first_seen, last_seen)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'detecting', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """,
                    new_id,
                    uuid.UUID(project_id) if len(project_id) == 36 else None,
                    error_type_val,
                    error_msg_val,
                    error_msg_val,
                    stack_trace_val,
                    signature,
                    json.dumps(payload.get("runtime") or {}),
                    environment,
                    service_name,
                    score,
                    severity,
                )
            incident_id = str(new_id)
            log.info("🚨 New incident %s (severity=%s, score=%.3f)", incident_id, severity, score)

        # ── 6. Broadcast Alert to WebSockets via PubSub ───────────
        anomaly_event = {
            "type": "ANOMALY_DETECTED",
            "incident_id": incident_id,
            "project_id": project_id,
            "service_name": service_name,
            "error_type": error_type_val,
            "error_message": error_msg_val,
            "severity": severity,
            "anomaly_score": score,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await r.publish(getattr(settings, "REDIS_ANOMALY_CHANNEL", "anomaly_events"), json.dumps(anomaly_event))

        # ── 7. Push to RAG Diagnose Stream ────────────────────────
        diagnose_stream = getattr(settings, "DIAGNOSE_STREAM", "diagnose_stream")
        await r.xadd(
            diagnose_stream,
            {
                "incident_id": str(incident_id),
                "project_id": str(project_id),
                "error_type": error_type_val,
                "error_message": error_msg_val,
                "service_name": service_name,
                "stack_trace": stack_trace_val,
                "severity": severity,
            },
            maxlen=100_000,
            approximate=True,
        )

    except Exception as exc:
        log.exception("Error processing telemetry event: %s", exc)


async def ensure_consumer_group(r: aioredis.Redis):
    """Create the consumer group if it doesn't exist."""
    stream_key = getattr(settings, "REDIS_STREAM_KEY", "telemetry_stream")
    group_name = getattr(settings, "STREAM_GROUP_ML", "ml-workers")
    try:
        await r.xgroup_create(
            stream_key,
            group_name,
            id="0",
            mkstream=True,
        )
        log.info("✅ Created consumer group %s on %s", group_name, stream_key)
    except Exception as e:
        if "BUSYGROUP" not in str(e):
            log.warning("Consumer group note: %s", e)


async def main():
    log.info("🎧 ML Anomaly Worker starting...")
    r = await aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_timeout=30,
        socket_connect_timeout=10,
        socket_keepalive=True,
        health_check_interval=15,
        retry_on_timeout=True,
    )
    await ensure_consumer_group(r)

<<<<<<< HEAD
    target_project_id = telemetry.get("project_id") or "00000000-0000-0000-0000-000000000001"
    source = str(telemetry.get("source") or ("simulation" if telemetry.get("type") == "SIMULATION_CRASH" else "sdk"))

    try:
        async with db_engine.begin() as conn:

            # ------------------------------------------------
            # Resolve service UUID scoped strictly to project
            # ------------------------------------------------

            result = await conn.execute(
                text(
                    """
                    SELECT id
                    FROM services
                    WHERE (project_id::text = :project_id OR project_id IS NULL)
                      AND (id::text = :identifier OR name = :identifier OR service_id = :identifier)
                    ORDER BY (project_id IS NOT NULL) DESC
                    LIMIT 1
                    """
                ),
                {
                    "identifier": service_identifier,
                    "project_id": str(target_project_id),
                },
            )

            service_row = result.first()

            if service_row:
                service_db_id = service_row[0]
                await conn.execute(
                    text("UPDATE services SET last_seen_at = CURRENT_TIMESTAMP, project_id = CAST(:project_id AS uuid) WHERE id = :id AND project_id IS NULL"),
                    {"id": service_db_id, "project_id": str(target_project_id)}
                )
                await conn.execute(
                    text("UPDATE services SET last_seen_at = CURRENT_TIMESTAMP WHERE id = :id"),
                    {"id": service_db_id}
                )

            else:
                # Auto-register unknown services with telemetry runtime under target project
                runtime = telemetry.get("runtime", "node")
                environment = telemetry.get("environment", "production")
                version = telemetry.get("version", "1.0.0")
                create_res = await conn.execute(
                    text(
                        """
                        INSERT INTO services (
                            project_id,
                            service_id,
                            name,
                            description,
                            runtime,
                            environment,
                            version,
                            status,
                            first_seen_at,
                            last_seen_at
                        )
                        VALUES (
                            CAST(:project_id AS uuid),
                            :service_id,
                            :name,
                            :description,
                            :runtime,
                            :environment,
                            :version,
                            'ACTIVE',
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        )
                        RETURNING id
                        """
                    ),
                    {
                        "project_id": str(target_project_id),
                        "service_id": service_identifier,
                        "name": service_identifier,
                        "runtime": runtime,
                        "environment": environment,
                        "version": version,
                        "description": f"Auto-discovered {runtime} service for {service_identifier}",
                    },
                )

                created_row = create_res.first()

                if not created_row:
                    logger.warning(
                        "Failed to create service for telemetry: %s",
                        service_identifier,
                    )
                    return None

                service_db_id = created_row[0]

            # ------------------------------------------------
            # Normalize timestamp
            # ------------------------------------------------

            timestamp_value = telemetry.get("timestamp")

            if isinstance(timestamp_value, str):
                try:
                    timestamp_value = datetime.fromisoformat(
                        timestamp_value.replace("Z", "+00:00")
                    )
                except ValueError:
                    timestamp_value = datetime.now(timezone.utc)

            elif not isinstance(timestamp_value, datetime):
                timestamp_value = datetime.now(timezone.utc)

            if timestamp_value.tzinfo is None:
                timestamp_value = timestamp_value.replace(
                    tzinfo=timezone.utc
                )

            # ------------------------------------------------
            # Insert telemetry record with project_id
            # ------------------------------------------------

            result = await conn.execute(
                text(
                    """
                    INSERT INTO telemetry_logs (
                        project_id,
                        service_id,
                        timestamp,
                        level,
                        message,
                        error_type,
                        stack_trace,
                        latency_ms,
                        status_code,
                        metadata,
                        source
                    )
                    VALUES (
                        CAST(:project_id AS uuid),
                        :service_id,
                        :timestamp,
                        :level,
                        :message,
                        :error_type,
                        :stack_trace,
                        :latency_ms,
                        :status_code,
                        CAST(:metadata AS JSONB),
                        :source
                    )
                    RETURNING id
                    """
                ),
                {
                    "project_id": str(target_project_id),
                    "service_id": service_db_id,
                    "timestamp": timestamp_value,
                    "level": (
                        telemetry.get("level")
                        or (
                            "ERROR"
                            if telemetry.get("error_type")
                            else "INFO"
                        )
                    ),
                    "message": (
                        telemetry.get("message")
                        or telemetry.get("log_message")
                        or ""
                    ),
                    "error_type": (
                        telemetry.get("error_type")
                        or None
                    ),
                    "stack_trace": (
                        telemetry.get("stack_trace")
                        or telemetry.get("raw_stack_trace")
                        or ""
                    ),
                    "latency_ms": float(
                        telemetry.get("latency_ms") or 0.0
                    ),
                    "status_code": int(
                        telemetry.get("status_code") or 200
                    ),
                    "metadata": json.dumps(
                        telemetry.get("metadata")
                        or {}
                    ),
                    "source": source,
                },
            )

            row = result.first()

            if row:
                telemetry_id = str(row[0])

                logger.info(
                    "Telemetry persisted to PostgreSQL | "
                    "id=%s | project=%s | service=%s",
                    telemetry_id,
                    target_project_id,
                    service_identifier,
                )

                return telemetry_id

    except Exception:
        logger.exception(
            "Failed to persist telemetry in PostgreSQL | "
            "service=%s",
            service_identifier,
        )

    return None


# ============================================================
# Create PostgreSQL Incident
# ============================================================

async def create_incident(
    telemetry: dict[str, Any],
    anomaly_score: float,
) -> str | None:

    if db_engine is None:

        logger.warning(
            "DATABASE_URL not configured; "
            "incident not stored"
        )

        return None

    service_identifier = str(telemetry.get("service_id", "unknown-service"))
    stack_trace = telemetry.get("stack_trace") or telemetry.get("raw_stack_trace") or telemetry.get("message", "")
    error_type = telemetry.get("error_type") or "SystemAnomaly"
    severity = "CRITICAL" if anomaly_score >= 0.85 else ("HIGH" if anomaly_score >= 0.70 else "MEDIUM")
    target_project_id = telemetry.get("project_id") or "00000000-0000-0000-0000-000000000001"

    try:

        async with db_engine.begin() as conn:

            # ------------------------------------------------
            # Find or create service strictly scoped to project
            # ------------------------------------------------
            service_db_id = None

            result = await conn.execute(
                text(
                    """
                    SELECT id
                    FROM services
                    WHERE (project_id::text = :project_id OR project_id IS NULL)
                      AND (id::text = :identifier OR name = :identifier OR service_id = :identifier)
                    ORDER BY (project_id IS NOT NULL) DESC
                    LIMIT 1
                    """
                ),
                {
                    "identifier": service_identifier,
                    "project_id": str(target_project_id),
                },
            )

            service_row = result.first()

            if service_row:
                service_db_id = service_row[0]
            else:
                # 2. Auto-create service scoped to target project
                runtime = telemetry.get("runtime", "node")
                environment = telemetry.get("environment", "production")
                version = telemetry.get("version", "1.0.0")
                create_res = await conn.execute(
                    text(
                        """
                        INSERT INTO services (
                            project_id, service_id, name, runtime, environment, version,
                            description, status, first_seen_at, last_seen_at
                        )
                        VALUES (
                            CAST(:project_id AS uuid), :service_id, :name, :runtime,
                            :environment, :version, :description, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                        )
                        RETURNING id
                        """
                    ),
                    {
                        "project_id": str(target_project_id),
                        "service_id": service_identifier,
                        "name": service_identifier,
                        "runtime": runtime,
                        "environment": environment,
                        "version": version,
                        "description": f"Auto-discovered {runtime} service for {service_identifier}",
                    },
                )
                created_row = create_res.first()
                if created_row:
                    service_db_id = created_row[0]

            if service_db_id is None:
                logger.warning(
                    "Service resolution failed for incident: %s",
                    service_identifier,
                )
                return None

            # ------------------------------------------------
            # Deduplicate repeated anomalies within 5m
            # ------------------------------------------------

            cooldown_cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)

            existing_result = await conn.execute(
                text(
                    """
                    SELECT id
                    FROM incidents
                    WHERE service_id = :service_id
                      AND error_type = :error_type
                      AND created_at >= :cooldown_cutoff
                    ORDER BY created_at DESC
                    LIMIT 1
                    """
                ),
                {
                    "service_id": service_db_id,
                    "error_type": error_type,
                    "cooldown_cutoff": cooldown_cutoff,
                },
            )

            existing_row = existing_result.first()

            if existing_row:
                incident_id = str(existing_row[0])

                logger.info(
                    "Duplicate anomaly suppressed | "
                    "incident_id=%s | service=%s | error_type=%s",
                    incident_id,
                    service_identifier,
                    error_type,
                )

                return None

            # ------------------------------------------------
            # Create incident in PostgreSQL matching schema
            # ------------------------------------------------
            source = str(telemetry.get("source") or ("simulation" if telemetry.get("type") == "SIMULATION_CRASH" else "sdk"))

            result = await conn.execute(
                text(
                    """
                    INSERT INTO incidents (
                        project_id,
                        service_id,
                        telemetry_id,
                        anomaly_score,
                        severity,
                        status,
                        source,
                        error_type,
                        stack_trace,
                        is_diagnosed,
                        created_at
                    )
                    VALUES (
                        CAST(:project_id AS uuid),
                        :service_id,
                        :telemetry_id,
                        :anomaly_score,
                        :severity,
                        'OPEN',
                        :source,
                        :error_type,
                        :stack_trace,
                        FALSE,
                        :created_at
                    )
                    RETURNING id
                    """
                ),
                {
                    "project_id": str(target_project_id),
                    "service_id": service_db_id,
                    "telemetry_id": telemetry.get("_telemetry_id"),
                    "anomaly_score": anomaly_score,
                    "severity": severity,
                    "source": source,
                    "error_type": error_type,
                    "stack_trace": stack_trace,
                    "created_at": datetime.now(timezone.utc),
                },
            )

            row = result.first()

            if row:

                incident_id = str(
                    row[0]
                )

                logger.info(
                    "Incident created in PostgreSQL | id=%s | project=%s | score=%.4f | severity=%s",
                    incident_id,
                    target_project_id,
                    anomaly_score,
                    severity,
                )

                return incident_id

    except Exception:

        logger.exception(
            "Failed to create incident in database"
        )

    return None


# ============================================================
# Publish Anomaly Event
# ============================================================

def publish_anomaly(
    telemetry: dict[str, Any],
    anomaly_score: float,
    incident_id: str | None,
):

    stack_trace = telemetry.get("stack_trace") or telemetry.get("raw_stack_trace") or ""
    service_id = str(telemetry.get("service_id", "unknown-service"))
    error_type = telemetry.get("error_type") or "SystemAnomaly"
    message = telemetry.get("message") or telemetry.get("log_message") or f"Anomaly detected in {service_id}"
    target_project_id = str(telemetry.get("project_id") or "00000000-0000-0000-0000-000000000001")

    event = {
        "type": "ANOMALY_DETECTED",
        "project_id": target_project_id,
        "incident_id": incident_id,
        "service_id": service_id,
        "message": message,
        "error_type": error_type,
        "stack_trace": stack_trace,
        "raw_stack_trace": stack_trace,
        "latency_ms": telemetry.get(
            "latency_ms", 0.0
        ),
        "status_code": telemetry.get(
            "status_code", 500
        ),
        "anomaly_score": anomaly_score,
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    try:

        redis_client.publish(
            os.getenv(
                "REDIS_ANOMALY_CHANNEL",
                "anomaly_events",
            ),
            json.dumps(
                event
            ),
        )

        logger.info(
            "Published anomaly event | project=%s | service=%s | incident=%s | score=%.4f",
            target_project_id,
            service_id,
            incident_id,
            anomaly_score,
        )

    except Exception:

        logger.exception(
            "Failed to publish anomaly event"
        )


# ============================================================
# Process One Telemetry Message
# ============================================================

async def process_message(
    stream_id: str,
    fields: dict[str, Any],
):

    telemetry = parse_stream_entry(
        stream_id,
        fields,
    )

    if telemetry is None:
        return

    service_id = str(
        telemetry.get(
            "service_id",
            "unknown",
        )
    )

    logger.info(
        "Processing telemetry | "
        "stream_id=%s | service=%s",
        stream_id,
        service_id,
    )

    # --------------------------------------------------------
    # Persist telemetry before ML processing
    # --------------------------------------------------------

    telemetry_id = await persist_telemetry(
        telemetry
    )

    # Keep the database ID available for incident creation.
    telemetry["_telemetry_id"] = telemetry_id

    # --------------------------------------------------------
    # Add telemetry to service-specific 5-minute rolling window
    # --------------------------------------------------------

    buffer_manager.add_log(
        telemetry
    )

    window_len = buffer_manager.get_buffer_size(service_id)

    logger.info(
        "Service rolling window size | service=%s | size=%d",
        service_id,
        window_len,
    )

    # --------------------------------------------------------
    # Generate service-specific features
    # --------------------------------------------------------

    features = buffer_manager.extract_features(service_id)

    logger.info(
        "Feature vector generated | service=%s | "
        "shape=%s | features=%s",
        service_id,
        features.shape,
        buffer_manager.get_feature_dict(service_id),
    )

    # --------------------------------------------------------
    # Run Isolation Forest
    # --------------------------------------------------------

    try:

        result = detector.analyze(
            features
        )

        anomaly_score = float(
            result.get(
                "anomaly_score",
                0.0,
            )
        )

        is_anomaly = bool(
            result.get(
                "is_anomaly",
                False,
            )
        )

    except Exception:

        logger.exception(
            "ML prediction failed"
        )

        anomaly_score = 0.0
        is_anomaly = False

    logger.info(
        "ML result | "
        "service=%s | score=%.4f | anomaly=%s",
        service_id,
        anomaly_score,
        is_anomaly,
    )

    # --------------------------------------------------------
    # Incident threshold
    # --------------------------------------------------------
    has_explicit_exception = bool(
        telemetry.get("error_type")
        or (str(telemetry.get("level", "")).upper() in ("ERROR", "CRITICAL"))
        or (int(telemetry.get("status_code", 200) or 200) >= 500)
        or (telemetry.get("type") == "SIMULATION_CRASH")
    )

    should_create_incident = (
        (is_anomaly and anomaly_score >= ANOMALY_THRESHOLD)
        or (has_explicit_exception and anomaly_score >= 0.65)
        or (telemetry.get("type") == "SIMULATION_CRASH")
    )

    if should_create_incident:
        effective_score = max(anomaly_score, 0.7832 if has_explicit_exception else anomaly_score)

        logger.warning(
            "ANOMALY DETECTED | "
            "service=%s | score=%.4f",
            service_id,
            effective_score,
        )

        incident_id = await create_incident(
            telemetry,
            effective_score,
        )

        if incident_id:
            publish_anomaly(
                telemetry,
                effective_score,
                incident_id,
            )

            logger.info(
                "AI diagnostic pipeline trigger prepared | "
                "incident=%s",
                incident_id,
            )

    else:

        logger.info(
            "Below incident threshold | "
            "service=%s | score=%.4f | threshold=%.4f",
            service_id,
            anomaly_score,
            ANOMALY_THRESHOLD,
        )


# ============================================================
# Process Redis Entries
# ============================================================

async def process_entries(
    messages,
):

    if not messages:
        return

    logger.info(
        "Processing %d Redis stream batch(es)",
        len(messages),
    )

    for stream_name, entries in messages:

        logger.info(
            "Processing stream=%s | entries=%d",
            stream_name,
            len(entries),
        )

        for stream_id, fields in entries:

            try:

                logger.info(
                    "Received Redis entry | stream_id=%s",
                    stream_id,
                )

                await process_message(
                    stream_id,
                    fields,
                )

                # ACK only after successful processing.
                redis_client.xack(
                    STREAM_KEY,
                    CONSUMER_GROUP,
                    stream_id,
                )

                logger.info(
                    "Message acknowledged | stream_id=%s",
                    stream_id,
                )

            except Exception:

                logger.exception(
                    "Message processing failed | "
                    "stream_id=%s",
                    stream_id,
                )

                # Failed messages remain pending.


# ============================================================
# Read Pending Messages
# ============================================================

def read_pending_messages():

    try:

        messages = redis_client.xreadgroup(
            groupname=CONSUMER_GROUP,
            consumername=CONSUMER_NAME,
            streams={
                STREAM_KEY: "0",
            },
            count=10,
            block=100,
        )

        if messages:

            actual_entries = sum(
                len(entries)
                for _, entries in messages
            )

            if actual_entries > 0:

                logger.warning(
                    "Redis recovery: found %d pending "
                    "message(s) owned by current consumer",
                    actual_entries,
                )

                return messages

        return []

    except Exception:

        logger.exception(
            "Redis pending-message recovery failed"
        )

        return []


# ============================================================
# Claim Stale Pending Messages
# ============================================================

def claim_stale_pending_messages():

    try:

        next_start_id, entries, deleted_ids = (
            redis_client.xautoclaim(
                name=STREAM_KEY,
                groupname=CONSUMER_GROUP,
                consumername=CONSUMER_NAME,
                min_idle_time=PENDING_IDLE_TIME_MS,
                start_id="0-0",
                count=10,
            )
        )

        if entries:

            logger.warning(
                "Redis recovery: claimed %d stale "
                "pending message(s) from previous consumer(s)",
                len(entries),
            )

            for stream_id, _ in entries:

                logger.warning(
                    "Claimed pending message | stream_id=%s",
                    stream_id,
                )

            return [
                (
                    STREAM_KEY,
                    entries,
                )
            ]

        logger.info(
            "Redis recovery: no stale pending messages found"
        )

        return []

    except redis.exceptions.ResponseError as exc:
        if "NOGROUP" in str(exc) or "no such key" in str(exc).lower():
            ensure_consumer_group()
        return []

    except Exception:

        logger.exception(
            "Redis XAUTOCLAIM recovery failed"
        )

        return []


# ============================================================
# Read New Messages
# ============================================================

def read_new_messages():

    try:

        messages = redis_client.xreadgroup(
            groupname=CONSUMER_GROUP,
            consumername=CONSUMER_NAME,
            streams={
                STREAM_KEY: ">",
            },
            count=10,
            block=1000,
        )

        return messages or []

    except redis.exceptions.ResponseError as exc:
        if "NOGROUP" in str(exc) or "no such key" in str(exc).lower():
            ensure_consumer_group()
        return []

    except Exception:

        logger.exception(
            "Redis new-message read failed"
        )

        return []


# ============================================================
# Main Consumer Loop
# ============================================================

async def consume_stream():

    ensure_consumer_group()

    logger.info(
        "ML worker started"
    )

    logger.info(
        "Stream: %s",
        STREAM_KEY,
    )

    logger.info(
        "Consumer group: %s",
        CONSUMER_GROUP,
    )

    logger.info(
        "Consumer: %s",
        CONSUMER_NAME,
    )

    logger.info(
        "Anomaly threshold: %.2f",
        ANOMALY_THRESHOLD,
    )

    logger.info(
        "Rolling window: %d seconds",
        int(
            os.getenv(
                "ANOMALY_WINDOW_SIZE_SECONDS",
                "300",
            )
        ),
    )

    logger.info(
        "Pending idle recovery time: %d ms",
        PENDING_IDLE_TIME_MS,
    )

    # --------------------------------------------------------
    # Recover current consumer's pending messages
    # --------------------------------------------------------

    pending = read_pending_messages()

    if pending:

        logger.warning(
            "Recovering pending messages for consumer=%s",
            CONSUMER_NAME,
        )

        await process_entries(
            pending
        )

    # --------------------------------------------------------
    # Claim stale messages from old consumers
    # --------------------------------------------------------

    stale_pending = claim_stale_pending_messages()

    if stale_pending:

        logger.warning(
            "Recovering stale pending messages for consumer=%s",
            CONSUMER_NAME,
        )

        await process_entries(
            stale_pending
        )

    # --------------------------------------------------------
    # Normal stream consumption
    # --------------------------------------------------------
=======
    stream_key = getattr(settings, "REDIS_STREAM_KEY", "telemetry_stream")
    group_name = getattr(settings, "STREAM_GROUP_ML", "ml-workers")
    consumer_name = f"ml-{os.getpid()}"
    
    log.info("Listening on stream=%s group=%s consumer=%s", stream_key, group_name, consumer_name)
>>>>>>> 9f420d2609525d61c582cceb64279c1885f42862

    while True:
        try:
            msgs = await r.xreadgroup(
                group_name,
                consumer_name,
                {stream_key: ">"},
                count=20,
                block=2000,
            )

            if not msgs:
                continue

            for _, entries in msgs:
                for msg_id, data in entries:
                    try:
                        await handle_event(r, data)
                        await r.xack(
                            stream_key,
                            group_name,
                            msg_id,
                        )
                    except Exception as e:
                        log.exception("Event handling failed for %s: %s", msg_id, e)

        except aioredis.ConnectionError as e:
            log.error("Redis connection lost: %s — retrying in 5s", e)
            await asyncio.sleep(5)
        except (aioredis.TimeoutError, asyncio.TimeoutError):
            await asyncio.sleep(0.1)
        except Exception as e:
            if "timeout" in str(e).lower():
                await asyncio.sleep(0.1)
            else:
                log.exception("Consumer loop error: %s", e)
                await asyncio.sleep(3)


if __name__ == "__main__":
    asyncio.run(main())