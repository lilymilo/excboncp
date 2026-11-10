"""
Rules Engine for exboncp land status evaluation.
Implements Blueprint Model 5 deterministic state transitions:
"Kode yang memutuskan, AI yang menjelaskan".
"""

from typing import Any


def compute_status(consent: str, dispute_open: bool, sensor_flag: bool) -> str:
    """
    Computes the deterministic land status following strict priority order.

    Priority hierarchy:
    1. consent == "none" -> "BLOCKED"
    2. consent == "revoked" or dispute_open == True -> "DISPUTE"
    3. sensor_flag == True (temp > 30.0 or flame detected) -> "WARNING"
    4. Otherwise -> "VERIFIED"

    Args:
        consent: Community consent state ("granted", "none", "revoked").
        dispute_open: Boolean indicating whether an open dispute is filed.
        sensor_flag: Boolean indicating whether physical sensors breached safe thresholds.

    Returns:
        One of the 4 absolute status strings: "BLOCKED", "DISPUTE", "WARNING", "VERIFIED".
    """
    normalized_consent = consent.strip().lower() if isinstance(consent, str) else "none"

    if normalized_consent == "none":
        return "BLOCKED"

    if normalized_consent == "revoked" or dispute_open is True:
        return "DISPUTE"

    if sensor_flag is True:
        return "WARNING"

    return "VERIFIED"


def explain_status(
    consent: str, dispute_open: bool, sensor_flag: bool, metrics: dict[str, Any] | None = None
) -> dict[str, Any]:
    """
    Produces human-readable explanation and metadata for a computed status.
    AI Explainer adheres to the principle: 'Kode memutuskan, AI menjelaskan'.

    Args:
        consent: Community consent state.
        dispute_open: Whether dispute is currently open.
        sensor_flag: Whether sensor anomaly flag is active.
        metrics: Optional sensor telemetry or satellite data.

    Returns:
        Structured dictionary containing status, human label, icon, and explanation.
    """
    status = compute_status(consent, dispute_open, sensor_flag)
    metrics_data = metrics or {}

    labels = {
        "BLOCKED": {
            "human_label": "Belum bisa dijual, menunggu izin komunitas",
            "icon": "lock",
            "badge_color": "red",
            "reason_code": "COMMUNITY_CONSENT_MISSING",
            "explanation": "Lahan tidak memiliki catatan persetujuan komunitas (consent = none). Sistem menolak seluruh transaksi.",
            "sellable": False,
        },
        "DISPUTE": {
            "human_label": "Ditahan, ada sengketa",
            "icon": "pause",
            "badge_color": "orange",
            "reason_code": "CONSENT_REVOKED_OR_DISPUTE_ACTIVE"
            if consent == "revoked"
            else "DISPUTE_OPEN",
            "explanation": "Terdapat keberatan aktif atau persetujuan komunitas dicabut. Seluruh penguncian dan transaksi dihentikan sementara.",
            "sellable": False,
        },
        "WARNING": {
            "human_label": "Perlu perhatian",
            "icon": "alert-triangle",
            "badge_color": "yellow",
            "reason_code": "SENSOR_ANOMALY_TRIGGERED",
            "explanation": "Sensor lapangan mendeteksi kondisi tidak biasa (suhu > 30°C atau terdeteksi nyala api). Sebagian unit karbon dibekukan.",
            "sellable": True,
            "freeze_partial_units": True,
        },
        "VERIFIED": {
            "human_label": "Terverifikasi",
            "icon": "check-circle",
            "badge_color": "green",
            "reason_code": "ALL_EVIDENCE_VALID",
            "explanation": "Seluruh bukti lengkap: persetujuan komunitas aktif, tidak ada sengketa, dan kondisi telemetri lapangan aman.",
            "sellable": True,
            "freeze_partial_units": False,
        },
    }

    info = labels[status].copy()
    info["status"] = status
    info["input_state"] = {
        "consent": consent,
        "dispute_open": dispute_open,
        "sensor_flag": sensor_flag,
    }
    if metrics_data:
        info["metrics"] = metrics_data

    return info
