"""Sensor ingestion and persistence service."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

import aiosqlite

from server.sensor.models import (
    SensorReadingResponse,
    SensorReadingWire,
    SensorSummaryResponse,
)
from server.sensor.signature import verify_telemetry_signature

logger = logging.getLogger("excboncp.sensor.service")

# Static registry mapping known hardware nodes and simulators to forest parcels.
DEVICE_REGISTRY: dict[str, str] = {
    "sim-esp-a-01": "PARCEL-A",
    "sim-esp-b-01": "PARCEL-B",
    "node-1": "PARCEL-A",
    "node-2": "PARCEL-B",
    "esp-01": "PARCEL-A",
    "esp-02": "PARCEL-B",
    "esp32-physical-node-01": "PARCEL-A",
    "esp32-wokwi-node-01": "PARCEL-A",
    "esp32-mock-fallback-01": "PARCEL-A",
}


def resolve_parcel_id(device_id: str) -> str:
    key = device_id.strip().lower()
    if key in DEVICE_REGISTRY:
        return DEVICE_REGISTRY[key]
    if device_id.startswith("PARCEL-"):
        return device_id
    raise ValueError(f"Perangkat '{device_id}' tidak terdaftar pada lahan mana pun.")


def evaluate_sensor_flag(
    temp_c: float, flame: int, threshold_temp: float = 30.0
) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    if flame == 1:
        reasons.append("Nyala api terdeteksi oleh sensor inframerah")
    if temp_c > threshold_temp:
        reasons.append(f"Suhu udara {temp_c:.1f}°C melebihi batas aman {threshold_temp:.1f}°C")
    return len(reasons) > 0, reasons


async def store_sensor_reading(
    db: aiosqlite.Connection, wire: SensorReadingWire
) -> SensorReadingResponse:
    # Reject forged or corrupted telemetry signatures before touching persistence.
    is_valid = verify_telemetry_signature(
        device_id=wire.device_id,
        ts=wire.ts,
        flame=wire.flame,
        temp_c=wire.temp_c,
        sig=wire.sig,
        source=wire.source,
        soil_pct=wire.soil_pct,
    )
    if not is_valid:
        raise ValueError("Verifikasi signature gagal: payload sensor tidak sah atau dipalsukan.")

    parcel_id = resolve_parcel_id(wire.device_id)

    # Verify parcel exists in database.
    async with db.execute(
        "SELECT id, current_status FROM parcels WHERE id = ?", (parcel_id,)
    ) as cursor:
        parcel = await cursor.fetchone()
    if parcel is None:
        raise ValueError(f"Parcel '{parcel_id}' tidak ditemukan di database.")

    has_flag, reasons = evaluate_sensor_flag(wire.temp_c, wire.flame)

    reading_id = str(uuid.uuid4())
    now_utc = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

    await db.execute(
        """
        INSERT INTO sensor_readings (
            id, parcel_id, device_id, ts, temp_c, humidity_pct,
            flame, soil_raw, soil_pct, source, sig, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            reading_id,
            parcel_id,
            wire.device_id,
            wire.ts,
            wire.temp_c,
            wire.humidity_pct,
            wire.flame,
            wire.soil_raw,
            wire.soil_pct,
            wire.source,
            wire.sig,
            now_utc,
        ),
    )

    # Automatically transition verified parcel to warning on active sensor anomaly.
    if has_flag and parcel["current_status"] == "VERIFIED":
        await db.execute(
            "UPDATE parcels SET current_status = 'WARNING' WHERE id = ?",
            (parcel_id,),
        )
        status_id = str(uuid.uuid4())
        await db.execute(
            """
            INSERT INTO status_results (
                id, parcel_id, status, reasons, rule_version,
                sensor_flag, consent_state, dispute_open, computed_at
            ) VALUES (?, ?, 'WARNING', ?, 'status-v1', 1, 'granted', 0, ?)
            """,
            (status_id, parcel_id, "; ".join(reasons), now_utc),
        )

    await db.commit()

    return SensorReadingResponse(
        id=reading_id,
        parcel_id=parcel_id,
        device_id=wire.device_id,
        ts=wire.ts,
        temp_c=wire.temp_c,
        humidity_pct=wire.humidity_pct,
        flame=wire.flame,
        soil_raw=wire.soil_raw,
        soil_pct=wire.soil_pct,
        source=wire.source,
        sig=wire.sig,
        received_at=now_utc,
        sensor_flag=has_flag,
        warning_reasons=reasons,
    )


async def list_sensor_readings(
    db: aiosqlite.Connection,
    parcel_id: str | None = None,
    device_id: str | None = None,
    limit: int = 50,
) -> list[SensorReadingResponse]:
    query = (
        "SELECT id, parcel_id, device_id, ts, temp_c, humidity_pct, "
        "flame, soil_raw, soil_pct, source, sig, received_at "
        "FROM sensor_readings"
    )
    clauses: list[str] = []
    params: list[object] = []

    if parcel_id:
        clauses.append("parcel_id = ?")
        params.append(parcel_id)
    if device_id:
        clauses.append("device_id = ?")
        params.append(device_id)

    if clauses:
        query += " WHERE " + " AND ".join(clauses)

    query += " ORDER BY ts DESC LIMIT ?"
    params.append(limit)

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    result: list[SensorReadingResponse] = []
    for row in rows:
        has_flag, reasons = evaluate_sensor_flag(float(row["temp_c"]), int(row["flame"]))
        result.append(
            SensorReadingResponse(
                id=row["id"],
                parcel_id=row["parcel_id"],
                device_id=row["device_id"],
                ts=row["ts"],
                temp_c=float(row["temp_c"]),
                humidity_pct=float(row["humidity_pct"]),
                flame=int(row["flame"]),
                soil_raw=int(row["soil_raw"]),
                soil_pct=float(row["soil_pct"]),
                source=row["source"],
                sig=row["sig"],
                received_at=row["received_at"],
                sensor_flag=has_flag,
                warning_reasons=reasons,
            )
        )
    return result


async def get_sensor_summary(
    db: aiosqlite.Connection, parcel_id: str, limit: int = 20
) -> SensorSummaryResponse:
    query = (
        "SELECT temp_c, humidity_pct, soil_pct, flame, ts "
        "FROM sensor_readings WHERE parcel_id = ? ORDER BY ts DESC LIMIT ?"
    )
    async with db.execute(query, (parcel_id, limit)) as cursor:
        rows = await cursor.fetchall()

    if not rows:
        return SensorSummaryResponse(
            parcel_id=parcel_id,
            sample_count=0,
            avg_temp_c=0.0,
            avg_humidity_pct=0.0,
            avg_soil_pct=0.0,
            flame_detected=False,
            sensor_flag=False,
            latest_ts=None,
        )

    count = len(rows)
    avg_temp = sum(float(r["temp_c"]) for r in rows) / count
    avg_hum = sum(float(r["humidity_pct"]) for r in rows) / count
    avg_soil = sum(float(r["soil_pct"]) for r in rows) / count
    flame_detected = any(int(r["flame"]) == 1 for r in rows)
    sensor_flag = flame_detected or avg_temp > 30.0

    return SensorSummaryResponse(
        parcel_id=parcel_id,
        sample_count=count,
        avg_temp_c=round(avg_temp, 2),
        avg_humidity_pct=round(avg_hum, 2),
        avg_soil_pct=round(avg_soil, 2),
        flame_detected=flame_detected,
        sensor_flag=sensor_flag,
        latest_ts=rows[0]["ts"],
    )
