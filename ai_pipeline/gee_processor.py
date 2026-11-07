import json
import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger("gee_processor")

_GEE_INITIALIZED: bool = False
_IS_MOCK_MODE: bool = False


def _is_placeholder_credential(key_path: Path) -> bool:
    try:
        with open(key_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            private_key = data.get("private_key", "")
            return "REPLACE_WITH_REAL" in private_key or not private_key
    except Exception:
        return True


def initialize_gee(
    key_path: Optional[str] = None,
    project_id: Optional[str] = None
) -> bool:
    global _GEE_INITIALIZED, _IS_MOCK_MODE

    resolved_project = project_id or os.getenv("GEE_PROJECT_ID", "cboncp")
    default_path = Path(__file__).resolve().parent / "service_account.json"
    resolved_path = Path(key_path or os.getenv("GEE_SERVICE_ACCOUNT_KEY_PATH", default_path))

    if not resolved_path.is_absolute():
        resolved_path = (Path(__file__).resolve().parent / resolved_path).resolve()

    if not resolved_path.exists() or _is_placeholder_credential(resolved_path):
        logger.warning(
            "Service account credential is empty or placeholder at %s. "
            "Running GEE processor in mock simulation mode.",
            resolved_path
        )
        _GEE_INITIALIZED = True
        _IS_MOCK_MODE = True
        return True

    try:
        import ee

        with open(resolved_path, "r", encoding="utf-8") as f:
            sa_data = json.load(f)
        sa_email = sa_data.get("client_email")

        credentials = ee.ServiceAccountCredentials(sa_email, str(resolved_path))
        ee.Initialize(credentials=credentials, project=resolved_project)
        _GEE_INITIALIZED = True
        _IS_MOCK_MODE = False
        logger.info("Earth Engine initialized successfully for project '%s'", resolved_project)
        return True
    except ImportError:
        logger.warning("earthengine-api not installed. Operating in simulation mode.")
        _GEE_INITIALIZED = True
        _IS_MOCK_MODE = True
        return True
    except Exception as exc:
        logger.error("Failed to initialize Earth Engine: %s", exc)
        _GEE_INITIALIZED = False
        _IS_MOCK_MODE = False
        return False


def fetch_satellite_data(
    lat: float,
    lon: float,
    date_range_days: int = 14,
    collection_id: str = "COPERNICUS/S2_SR_HARMONIZED",
    max_cloud_percent: float = 20.0
) -> Dict[str, Any]:
    global _GEE_INITIALIZED, _IS_MOCK_MODE

    if not _GEE_INITIALIZED:
        success = initialize_gee()
        if not success:
            return {
                "status": "error",
                "message": "Earth Engine initialization failed",
                "coordinates": {"lat": lat, "lon": lon}
            }

    now_utc = datetime.now(timezone.utc)
    start_utc = now_utc - timedelta(days=date_range_days)

    if _IS_MOCK_MODE:
        return {
            "status": "simulated",
            "provider": "Google Earth Engine (Mock Simulation)",
            "collection": collection_id,
            "image_id": f"{collection_id}/20261105T032021_MOCK_TILES",
            "acquisition_date": (now_utc - timedelta(days=1)).strftime("%Y-%m-%d"),
            "cloud_coverage_pct": 8.4,
            "coordinates": {"lat": lat, "lon": lon},
            "thumbnail_url": (
                f"https://earthengine.googleapis.com/v1/projects/cboncp/thumbnails/"
                f"mock-s2-{abs(lat):.4f}-{abs(lon):.4f}"
            ),
            "verified_at": now_utc.isoformat(),
            "note": "Populate valid service_account.json to stream live GEE satellite feeds."
        }

    try:
        import ee

        # Earth Engine expects GeoJSON coordinates in [longitude, latitude] order
        point = ee.Geometry.Point([lon, lat])
        buffer_region = point.buffer(2500).bounds()

        date_start_str = start_utc.strftime("%Y-%m-%d")
        date_end_str = now_utc.strftime("%Y-%m-%d")

        col = (
            ee.ImageCollection(collection_id)
            .filterBounds(buffer_region)
            .filterDate(date_start_str, date_end_str)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud_percent))
            .sort("CLOUDY_PIXEL_PERCENTAGE", True)
        )

        image_count = col.size().getInfo()
        if image_count == 0:
            logger.info("No cloud-free Sentinel-2 images found within %d days, relaxing cloud filter", date_range_days)
            col = (
                ee.ImageCollection(collection_id)
                .filterBounds(buffer_region)
                .filterDate(date_start_str, date_end_str)
                .sort("CLOUDY_PIXEL_PERCENTAGE", True)
            )
            image_count = col.size().getInfo()
            if image_count == 0:
                return {
                    "status": "not_found",
                    "collection": collection_id,
                    "message": "No satellite imagery available for specified coordinates and date range.",
                    "coordinates": {"lat": lat, "lon": lon}
                }

        image = col.first()
        props = image.getInfo().get("properties", {})
        image_id = image.id().getInfo()
        cloud_pct = props.get("CLOUDY_PIXEL_PERCENTAGE", 0.0)

        full_asset_id = f"{collection_id}/{image_id}" if not image_id.startswith(collection_id) else image_id

        # Sentinel-2 L2A true color bands: B4 (Red), B3 (Green), B2 (Blue)
        vis_params = {
            "min": 0,
            "max": 3000,
            "bands": ["B4", "B3", "B2"],
            "dimensions": 512,
            "region": buffer_region
        }

        # Generate direct satellite visual viewer link
        try:
            thumb_url = image.getThumbURL(vis_params)
        except Exception:
            # Fallback to Copernicus Sentinel-2 browser viewer centered at sensor coordinates
            thumb_url = f"https://browser.dataspace.copernicus.eu/?zoom=14&lat={lat}&lng={lon}"

        raw_time = props.get("system:time_start")
        acq_date = (
            datetime.fromtimestamp(raw_time / 1000.0, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            if raw_time else date_end_str
        )

        ee_script = (
            f"var image = ee.Image('{full_asset_id}');\n"
            f"Map.setCenter({lon}, {lat}, 12);\n"
            f"Map.addLayer(image, {{bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}}, 'Sentinel-2 L2A');\n"
            f"Map.addLayer(ee.Geometry.Point([{lon}, {lat}]), {{color: 'red'}}, 'Sensor Node');"
        )

        return {
            "status": "success",
            "provider": "Google Earth Engine",
            "collection": collection_id,
            "image_id": full_asset_id,
            "acquisition_date": acq_date,
            "cloud_coverage_pct": round(float(cloud_pct), 2),
            "coordinates": {"lat": lat, "lon": lon},
            "thumbnail_url": thumb_url,
            "code_editor_script": ee_script,
            "verified_at": now_utc.isoformat()
        }

    except Exception as exc:
        logger.error("Error executing GEE query for (%f, %f): %s", lat, lon, exc)
        return {
            "status": "error",
            "error": str(exc),
            "coordinates": {"lat": lat, "lon": lon}
        }

