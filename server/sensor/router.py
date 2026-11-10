"""ExcbonCP Central Server — Sensor telemetry router."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from server.database import get_db
from server.sensor.models import (
    SensorReadingResponse,
    SensorReadingWire,
    SensorSummaryResponse,
)
from server.sensor.service import (
    get_sensor_summary,
    list_sensor_readings,
    store_sensor_reading,
)

logger = logging.getLogger("excboncp.sensor.router")

router = APIRouter(prefix="/api/sensor", tags=["sensor"])


@router.post(
    "/readings",
    response_model=SensorReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest sensor reading and verify signature",
)
async def ingest_sensor_reading(body: SensorReadingWire) -> SensorReadingResponse:
    db = await get_db()
    try:
        return await store_sensor_reading(db, body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/readings",
    response_model=list[SensorReadingResponse],
    summary="List historical sensor readings",
)
async def get_sensor_readings(
    parcel_id: str | None = Query(None, description="Filter by parcel ID"),
    device_id: str | None = Query(None, description="Filter by device ID"),
    limit: int = Query(50, ge=1, le=500, description="Maximum rows returned"),
) -> list[SensorReadingResponse]:
    db = await get_db()
    return await list_sensor_readings(db, parcel_id=parcel_id, device_id=device_id, limit=limit)


@router.get(
    "/summary/{parcel_id}",
    response_model=SensorSummaryResponse,
    summary="Get aggregated sensor summary for a parcel",
)
async def get_summary(parcel_id: str) -> SensorSummaryResponse:
    db = await get_db()
    return await get_sensor_summary(db, parcel_id)
