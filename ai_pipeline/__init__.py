"""
AI Pipeline backend package for exboncp (Davin - Rules & Land Data Pipeline).
Subscribes to real-time ESP32 node telemetry, enforces deterministic land status rules,
and provides Google Earth Engine verification with offline cache resilience.
"""

from .gee_processor import fetch_satellite_data, initialize_gee, load_cached_satellite_data
from .rules_engine import compute_status, explain_status

__all__ = [
    "compute_status",
    "explain_status",
    "initialize_gee",
    "fetch_satellite_data",
    "load_cached_satellite_data",
]
