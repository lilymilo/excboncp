"""
AI Pipeline backend package for exboncp.
Subscribes to real-time ESP32 node telemetry and triggers GEE satellite verification on anomalies.
"""

from .gee_processor import fetch_satellite_data, initialize_gee
from .mqtt_subscriber import evaluate_anomaly, start_subscriber, validate_telemetry

__all__ = [
    "initialize_gee",
    "fetch_satellite_data",
    "validate_telemetry",
    "evaluate_anomaly",
    "start_subscriber",
]

