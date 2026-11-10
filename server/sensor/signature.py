"""Cryptographic telemetry signature validation for sensor ingestion."""

from __future__ import annotations

import hashlib
import json
import os
from typing import Any

DEFAULT_SENSOR_SECRET = os.getenv("SENSOR_SECRET", "EXCBONCP_DEMO_SECRET")


def compute_wire_signature(
    device_id: str,
    ts: str,
    flame: int,
    temp_c: float,
    secret: str = DEFAULT_SENSOR_SECRET,
) -> str:
    sig_raw = f"{device_id}|{ts}|{flame}|{temp_c:.1f}{secret}"
    return "0x" + hashlib.sha256(sig_raw.encode("utf-8")).hexdigest()


def compute_json_signature(payload: dict[str, Any]) -> str:
    canonical = json.dumps(
        {
            "node_id": payload.get("device_id") or payload.get("node_id"),
            "soil_moisture": payload.get("soil_pct") or payload.get("soil_moisture"),
            "temperature": payload.get("temp_c") or payload.get("temperature"),
            "flame_detected": bool(payload.get("flame") or payload.get("flame_detected")),
        },
        sort_keys=True,
    )
    return "0x" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def verify_telemetry_signature(
    device_id: str,
    ts: str,
    flame: int,
    temp_c: float,
    sig: str | None,
    source: str = "esp",
    soil_pct: float | None = None,
    secret: str = DEFAULT_SENSOR_SECRET,
) -> bool:
    # Simulator payloads with explicit null signature are permitted per Model 3 contract.
    if source == "simulator" and (sig is None or sig == "" or sig == "none"):
        return True

    if not sig:
        return False

    normalized_sig = sig.lower()
    if not normalized_sig.startswith("0x"):
        normalized_sig = "0x" + normalized_sig

    # Candidate 1: standard wire format with 1-decimal float.
    c1 = compute_wire_signature(device_id, ts, flame, temp_c, secret).lower()
    if normalized_sig == c1:
        return True

    # Candidate 2: standard wire format with raw float.
    sig_raw_alt = f"{device_id}|{ts}|{flame}|{temp_c}{secret}"
    c2 = ("0x" + hashlib.sha256(sig_raw_alt.encode("utf-8")).hexdigest()).lower()
    if normalized_sig == c2:
        return True

    # Candidate 3: JSON-normalized format from gateway.
    if soil_pct is not None:
        c3 = compute_json_signature(
            {
                "device_id": device_id,
                "soil_pct": soil_pct,
                "temp_c": temp_c,
                "flame": flame,
            }
        ).lower()
        if normalized_sig == c3:
            return True

    return False
