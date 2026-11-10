"""Sensor ingestion and persistence service."""

from __future__ import annotations

import json
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


FIRE_STATUS = ("NORMAL", "WASPADA", "SIAGA", "BAHAYA")

# Thresholds sit near real combustion heat so a hot afternoon never reads as fire.
TEMP_HOT = 38.0
TEMP_VERY_HOT = 48.0
TEMP_PRE_FIRE = 55.0
TEMP_FIRE = 65.0
SOIL_DRY = 40.0
SOIL_ARID = 20.0
FLAME_CONFIRM_READINGS = 3
CLEAR_READINGS = 10


def evaluate_fire_level(
    temp_c: float, flame: int, soil_pct: float, prev_flames: list[int]
) -> tuple[int, list[str]]:
    """Return (level 0-3, reasons). prev_flames is newest-first, excluding this reading."""
    streak = 0
    if flame == 1:
        streak = 1
        for prev in prev_flames:
            if prev != 1:
                break
            streak += 1

    if streak >= FLAME_CONFIRM_READINGS:
        return 3, [f"Nyala api terkonfirmasi {streak} pembacaan berturut-turut"]
    if temp_c >= TEMP_FIRE:
        return 3, [f"Suhu {temp_c:.1f}°C setara panas api nyata"]

    if streak:
        return 2, [f"Nyala api terdeteksi ({streak}/{FLAME_CONFIRM_READINGS} untuk konfirmasi)"]
    if temp_c >= TEMP_PRE_FIRE:
        return 2, [f"Suhu {temp_c:.1f}°C mendekati panas pembakaran"]
    if temp_c >= TEMP_VERY_HOT and soil_pct < SOIL_ARID:
        return 2, [f"Suhu {temp_c:.1f}°C dan tanah sangat gersang ({soil_pct:.0f}%)"]

    # Fusi fleksibel: Suhu sejuk (< 35°C) selalu NORMAL karena tidak ada pemicu termal.
    # Level WASPADA hanya aktif jika cuaca mulai panas (>= 35°C) bertemu tanah mengering (< 50%),
    # atau saat cuaca sangat terik menyengat (>= 42°C).
    if temp_c >= 42.0:
        return 1, [f"Cuaca sangat terik {temp_c:.1f}°C"]
    if temp_c >= 35.0 and soil_pct < 50.0:
        return 1, [f"Suhu terik {temp_c:.1f}°C dan tanah mengering ({soil_pct:.0f}%)"]

    return 0, []


def resolve_sensor_flag(level: int, prev_flag: bool, prev_levels: list[int]) -> bool:
    """Flag raises at level 3 and only clears after CLEAR_READINGS normal readings in a row."""
    if level == 3:
        return True
    if not prev_flag:
        return False
    recent = [level, *prev_levels[: CLEAR_READINGS - 1]]
    return not (len(recent) == CLEAR_READINGS and all(lv == 0 for lv in recent))


def parcel_centroid(polygon_geojson: str | None) -> tuple[float, float] | None:
    # Fallback for nodes that could not auto-detect a location.
    try:
        ring = json.loads(polygon_geojson or "")["coordinates"][0]
        if len(ring) > 1 and ring[0] == ring[-1]:
            ring = ring[:-1]  # closing vertex repeats the first one
        return (
            sum(p[1] for p in ring) / len(ring),
            sum(p[0] for p in ring) / len(ring),
        )
    except (ValueError, KeyError, IndexError, TypeError, ZeroDivisionError):
        return None


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
        "SELECT id, current_status, polygon_geojson FROM parcels WHERE id = ?", (parcel_id,)
    ) as cursor:
        parcel = await cursor.fetchone()
    if parcel is None:
        raise ValueError(f"Parcel '{parcel_id}' tidak ditemukan di database.")

    async with db.execute(
        "SELECT flame, fire_level, sensor_flag FROM sensor_readings WHERE parcel_id = ? "
        "ORDER BY ts DESC, received_at DESC, rowid DESC LIMIT ?",
        (parcel_id, CLEAR_READINGS - 1),
    ) as cursor:
        history = await cursor.fetchall()

    level, reasons = evaluate_fire_level(
        wire.temp_c, wire.flame, wire.soil_pct, [int(r["flame"]) for r in history]
    )
    has_flag = resolve_sensor_flag(
        level,
        bool(history and history[0]["sensor_flag"]),
        [int(r["fire_level"]) for r in history],
    )

    lat, lon = wire.lat, wire.lon
    if lat is None or lon is None:
        lat, lon = parcel_centroid(parcel["polygon_geojson"]) or (None, None)

    reading_id = str(uuid.uuid4())
    now_utc = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

    await db.execute(
        """
        INSERT INTO sensor_readings (
            id, parcel_id, device_id, ts, temp_c, humidity_pct,
            flame, soil_raw, soil_pct, source, sig, received_at,
            lat, lon, fire_level, sensor_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            lat,
            lon,
            level,
            int(has_flag),
        ),
    )

    # Automatically transition verified parcel to warning on a confirmed fire.
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
        lat=lat,
        lon=lon,
        fire_level=level,
        fire_status=FIRE_STATUS[level],
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
        "flame, soil_raw, soil_pct, source, sig, received_at, "
        "lat, lon, fire_level, sensor_flag "
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

    return [
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
            lat=row["lat"],
            lon=row["lon"],
            fire_level=int(row["fire_level"]),
            fire_status=FIRE_STATUS[int(row["fire_level"])],
            sensor_flag=bool(row["sensor_flag"]),
        )
        for row in rows
    ]


async def get_sensor_summary(
    db: aiosqlite.Connection, parcel_id: str, limit: int = 20
) -> SensorSummaryResponse:
    query = (
        "SELECT temp_c, humidity_pct, soil_pct, flame, sensor_flag, ts "
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
    sensor_flag = bool(rows[0]["sensor_flag"])

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
