"""ExcbonCP Central Server — Sensor ingestion Pydantic models."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class SensorReadingWire(BaseModel):
    device_id: str = Field(..., min_length=1, max_length=100)
    ts: str = Field(..., description="ISO-8601 UTC sensor timestamp")
    temp_c: float = Field(..., description="Air temperature in Celsius")
    humidity_pct: float = Field(..., ge=0, le=100, description="Relative humidity percentage")
    flame: int = Field(..., ge=0, le=1, description="Flame digital indicator: 0 or 1")
    soil_raw: int = Field(..., ge=0, description="Raw ADC soil reading")
    soil_pct: float = Field(..., ge=0, le=100, description="Calibrated soil percentage")
    source: Literal["esp", "simulator"] = Field("esp", description="Data source provider")
    sig: str | None = Field(None, description="SHA-256 signature when enabled")
    lat: float | None = Field(None, ge=-90, le=90, description="Auto-detected latitude")
    lon: float | None = Field(None, ge=-180, le=180, description="Auto-detected longitude")
    fire_level: int | None = Field(None, ge=0, le=3, description="Edge-computed fire level")
    fire_status: str | None = Field(None, description="Edge-computed fire status label")


class SensorReadingResponse(BaseModel):
    id: str
    parcel_id: str
    device_id: str
    ts: str
    temp_c: float
    humidity_pct: float
    flame: int
    soil_raw: int
    soil_pct: float
    source: str
    sig: str | None = None
    received_at: str
    lat: float | None = None
    lon: float | None = None
    fire_level: int = Field(0, ge=0, le=3, description="0=NORMAL, 1=WASPADA, 2=SIAGA, 3=BAHAYA")
    fire_status: str = "NORMAL"
    sensor_flag: bool = False
    warning_reasons: list[str] = Field(default_factory=list)


class SensorSummaryResponse(BaseModel):
    parcel_id: str
    sample_count: int
    avg_temp_c: float
    avg_humidity_pct: float
    avg_soil_pct: float
    flame_detected: bool
    sensor_flag: bool
    latest_ts: str | None = None
