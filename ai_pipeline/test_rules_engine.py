"""
Unit tests for exboncp rules engine (compute_status and explain_status).
Covers all 7 state transitions from Blueprint Model 5.
"""

import pytest
from ai_pipeline.rules_engine import compute_status, explain_status


def test_priority_1_consent_none_is_blocked():
    # Model 5 transition 1: no community consent results in BLOCKED
    status = compute_status(consent="none", dispute_open=False, sensor_flag=False)
    assert status == "BLOCKED"


def test_priority_1_consent_none_overrides_dispute_and_sensor():
    # Priority check: consent=none dominates over active dispute and active sensor flag
    status = compute_status(consent="none", dispute_open=True, sensor_flag=True)
    assert status == "BLOCKED"


def test_priority_2_consent_revoked_is_dispute():
    # Model 5 transition 2: community revoked consent results in DISPUTE
    status = compute_status(consent="revoked", dispute_open=False, sensor_flag=False)
    assert status == "DISPUTE"


def test_priority_2_dispute_open_with_granted_consent():
    # Model 5 transition 3: open dispute results in DISPUTE even with granted consent
    status = compute_status(consent="granted", dispute_open=True, sensor_flag=False)
    assert status == "DISPUTE"


def test_priority_2_dispute_overrides_sensor_warning():
    # Priority check: dispute state dominates over sensor flag
    status = compute_status(consent="granted", dispute_open=True, sensor_flag=True)
    assert status == "DISPUTE"


def test_priority_3_sensor_flag_triggers_warning():
    # Model 5 transition 4: sensor anomaly triggers WARNING when consent is granted
    status = compute_status(consent="granted", dispute_open=False, sensor_flag=True)
    assert status == "WARNING"


def test_priority_4_verified_when_all_clear():
    # Model 5 transition 5: full evidence with no issues produces VERIFIED
    status = compute_status(consent="granted", dispute_open=False, sensor_flag=False)
    assert status == "VERIFIED"


def test_consent_case_insensitivity_and_whitespace():
    # Robustness test: handles surrounding whitespace and varying letter cases
    assert compute_status(consent="  NONE  ", dispute_open=False, sensor_flag=False) == "BLOCKED"
    assert compute_status(consent="REVOKED", dispute_open=False, sensor_flag=False) == "DISPUTE"
    assert compute_status(consent=" Granted ", dispute_open=False, sensor_flag=False) == "VERIFIED"


def test_explain_status_metadata_and_sellability():
    # Adheres to 'Kode memutuskan, AI menjelaskan'
    exp_blocked = explain_status("none", False, False)
    assert exp_blocked["status"] == "BLOCKED"
    assert exp_blocked["sellable"] is False
    assert "menunggu izin komunitas" in exp_blocked["human_label"]

    exp_warning = explain_status("granted", False, True, {"temperature": 34.2})
    assert exp_warning["status"] == "WARNING"
    assert exp_warning["freeze_partial_units"] is True
    assert exp_warning["metrics"]["temperature"] == 34.2

    exp_verified = explain_status("granted", False, False)
    assert exp_verified["status"] == "VERIFIED"
    assert exp_verified["sellable"] is True
