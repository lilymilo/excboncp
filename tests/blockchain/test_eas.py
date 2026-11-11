"""
ExcbonCP — EAS Attestation Tests (R7).

Tests for ``src/blockchain/eas.py`` and ``src/blockchain/service.py``.

The suite runs in simulation mode; no RPC endpoint is contacted and no
testnet gas is spent.

Run with: pytest tests/blockchain/test_eas.py -v
"""

from __future__ import annotations

from typing import Any

import pytest

from server.ledger.service import append_block
from src.blockchain.eas import (
    PARCEL_ATTESTATION_SCHEMA,
    SCHEMA_ID,
    EasClient,
    get_eas_client,
    reset_eas_client,
)
from src.blockchain.service import (
    anchor_block_to_eas,
    get_attestation_status,
    get_attested_blocks,
    verify_auditor,
)

AUDITOR_ID = "usr-auditor-001"
AUDITOR_USERNAME = "auditor_demo"
AUDITOR_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


# ---------------------------------------------------------------------------
# EAS Client Tests
# ---------------------------------------------------------------------------


def test_eas_client_creation() -> None:
    """The client can be created with a valid 32-byte private key."""
    client = EasClient(private_key=TEST_PRIVATE_KEY)
    assert client.private_key == TEST_PRIVATE_KEY
    assert client.simulation_mode is True
    assert client.schema_id == SCHEMA_ID


def test_eas_client_without_key_uses_simulation(monkeypatch: pytest.MonkeyPatch) -> None:
    """A missing key must never crash the server or send a transaction."""
    monkeypatch.delenv("EVM_PRIVATE_KEY", raising=False)
    client = EasClient(private_key="")
    assert client.simulation_mode is True
    assert client.account is None


def test_get_eas_client_singleton() -> None:
    """get_eas_client returns one process-wide instance."""
    reset_eas_client()
    client1 = get_eas_client(TEST_PRIVATE_KEY)
    client2 = get_eas_client()
    assert client1 is client2
    reset_eas_client()


def test_schema_id_is_keccak_of_canonical_schema() -> None:
    """The schema string is the canonical EAS field list, not a display name."""
    try:
        from eth_utils import keccak
    except ImportError:
        import pytest

        pytest.skip("eth_utils is not installed in local environment")

    expected = "0x" + keccak(text=PARCEL_ATTESTATION_SCHEMA).hex()
    assert expected == SCHEMA_ID
    assert len(SCHEMA_ID) == 66
    assert PARCEL_ATTESTATION_SCHEMA.startswith("string parcelId,")


async def test_register_schema_simulation(test_db: Any, eas_client: EasClient) -> None:
    """Schema registration is recorded locally and is idempotent."""
    first = await eas_client.register_schema(test_db)
    second = await eas_client.register_schema(test_db)

    assert first["registered"] is True
    assert first["schema_id"] == SCHEMA_ID
    assert second["registered"] is True
    assert second["schema_id"] == SCHEMA_ID

    async with test_db.execute("SELECT COUNT(*) FROM eas_registrations") as cursor:
        row = await cursor.fetchone()
    assert row[0] == 1


async def test_attest_simulation(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """A verified block is anchored locally with a simulated UID."""
    async with test_db.execute(
        "SELECT current_hash, parcel_id, co2e_metric_tons FROM ledger_blocks WHERE block_index = ?",
        (sample_ledger_blocks[0],),
    ) as cursor:
        block_hash, parcel_id, co2e = await cursor.fetchone()

    result = await eas_client.attest(
        parcel_id=parcel_id,
        co2e_metric_tons=co2e,
        ledger_block_hash=block_hash,
        status="VERIFIED",
        auditor_id=AUDITOR_ID,
        auditor_address=AUDITOR_WALLET,
        db=test_db,
    )

    assert result.success is True
    assert result.attestation_uid is not None
    assert result.attestation_uid.startswith("0x")
    assert len(result.attestation_uid) == 66
    assert result.on_chain is False
    assert result.parcel_id == parcel_id

    async with test_db.execute(
        "SELECT eas_uid, auditor_id, on_chain FROM attestations WHERE block_hash = ?",
        (block_hash,),
    ) as cursor:
        row = await cursor.fetchone()
    assert row["eas_uid"] == result.attestation_uid
    assert row["auditor_id"] == AUDITOR_ID
    assert row["on_chain"] == 0


async def test_attest_rejects_non_verified_status(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """WARNING, DISPUTE, and BLOCKED blocks cannot be attested."""
    async with test_db.execute(
        "SELECT current_hash FROM ledger_blocks WHERE block_index = ?",
        (sample_ledger_blocks[0],),
    ) as cursor:
        block_hash = (await cursor.fetchone())[0]

    for status in ("WARNING", "DISPUTE", "BLOCKED"):
        result = await eas_client.attest(
            parcel_id="PARCEL-A",
            co2e_metric_tons=142.85,
            ledger_block_hash=block_hash,
            status=status,
            auditor_id=AUDITOR_ID,
            db=test_db,
        )
        assert result.success is False
        assert "VERIFIED" in result.message

    async with test_db.execute("SELECT COUNT(*) FROM attestations") as cursor:
        assert (await cursor.fetchone())[0] == 0


async def test_attest_rejects_duplicate_block(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """The same ledger hash cannot be anchored twice."""
    async with test_db.execute(
        "SELECT current_hash, parcel_id, co2e_metric_tons FROM ledger_blocks WHERE block_index = ?",
        (sample_ledger_blocks[0],),
    ) as cursor:
        block_hash, parcel_id, co2e = await cursor.fetchone()

    first = await eas_client.attest(
        parcel_id=parcel_id,
        co2e_metric_tons=co2e,
        ledger_block_hash=block_hash,
        auditor_id=AUDITOR_ID,
        db=test_db,
    )
    second = await eas_client.attest(
        parcel_id=parcel_id,
        co2e_metric_tons=co2e,
        ledger_block_hash=block_hash,
        auditor_id=AUDITOR_ID,
        db=test_db,
    )

    assert first.success is True
    assert second.success is False
    assert "already attested" in second.message.lower()


# ---------------------------------------------------------------------------
# Service Layer Tests
# ---------------------------------------------------------------------------


async def test_verify_auditor_success(test_db: Any, auditor_user: dict[str, Any]) -> None:
    """A valid auditor user is returned."""
    auditor = await verify_auditor(test_db, AUDITOR_USERNAME)
    assert auditor is not None
    assert auditor["id"] == AUDITOR_ID
    assert auditor["username"] == AUDITOR_USERNAME
    assert auditor["role"] == "auditor"


async def test_verify_auditor_failure_wrong_role(test_db: Any, member_user: dict[str, Any]) -> None:
    """A user without the auditor role is rejected."""
    assert await verify_auditor(test_db, member_user["username"]) is None


async def test_verify_auditor_failure_missing(test_db: Any) -> None:
    """An unknown auditor username is rejected."""
    assert await verify_auditor(test_db, "nonexistent") is None


async def test_anchor_block_to_eas_simulation(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """Anchoring updates ledger_blocks.eas_uid and records the attestation."""
    block_index = sample_ledger_blocks[0]

    result = await anchor_block_to_eas(
        block_index=block_index,
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )

    assert result.success is True
    assert result.eas_attestation_uid is not None
    assert result.on_chain is False
    assert result.block_index == block_index

    async with test_db.execute(
        "SELECT eas_uid FROM ledger_blocks WHERE block_index = ?", (block_index,)
    ) as cursor:
        assert (await cursor.fetchone())[0] == result.eas_attestation_uid


async def test_anchor_block_without_auditor(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """Anchoring with an unknown auditor identity fails."""
    result = await anchor_block_to_eas(
        block_index=sample_ledger_blocks[0],
        auditor_username="missing_auditor",
        client=eas_client,
        db=test_db,
    )

    assert result.success is False
    assert result.reason == "auditor"


async def test_anchor_block_with_non_auditor_role(
    test_db: Any,
    sample_ledger_blocks: list[int],
    member_user: dict[str, Any],
    eas_client: EasClient,
) -> None:
    """A manager/member account cannot anchor even if it exists."""
    result = await anchor_block_to_eas(
        block_index=sample_ledger_blocks[0],
        auditor_username=member_user["username"],
        client=eas_client,
        db=test_db,
    )

    assert result.success is False
    assert result.reason == "auditor"


async def test_anchor_block_rejects_non_verified(
    test_db: Any,
    auditor_user: dict[str, Any],
    eas_client: EasClient,
) -> None:
    """Only VERIFIED ledger blocks may be anchored."""
    block = await append_block(
        test_db,
        {
            "parcel_id": "PARCEL-A",
            "timestamp": "2026-11-12T14:00:00Z",
            "co2e_t": 12.0,
            "status": "WARNING",
        },
        approved_by=AUDITOR_ID,
    )

    result = await anchor_block_to_eas(
        block_index=block["id"],
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )

    assert result.success is False
    assert result.reason == "not_verified"


async def test_anchor_block_twice_conflicts(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """An already-anchored block returns a conflict reason, not a duplicate row."""
    first = await anchor_block_to_eas(
        block_index=sample_ledger_blocks[0],
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )
    second = await anchor_block_to_eas(
        block_index=sample_ledger_blocks[0],
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )

    assert first.success is True
    assert second.success is False
    assert second.reason == "already_attested"

    async with test_db.execute("SELECT COUNT(*) FROM attestations") as cursor:
        assert (await cursor.fetchone())[0] == 1


async def test_get_attested_blocks(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """Attested blocks are listed with their ledger index."""
    result = await anchor_block_to_eas(
        block_index=sample_ledger_blocks[1],
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )
    assert result.success is True

    attestations = await get_attested_blocks(test_db)
    assert len(attestations) == 1
    assert attestations[0]["block_index"] == sample_ledger_blocks[1]
    assert attestations[0]["eas_uid"] == result.eas_attestation_uid
    assert attestations[0]["on_chain"] is False


async def test_attestation_status_before_and_after(
    test_db: Any,
    sample_ledger_blocks: list[int],
    eas_client: EasClient,
) -> None:
    """Status flips from unattested to attested after anchoring."""
    block_index = sample_ledger_blocks[0]

    before = await get_attestation_status(test_db, block_index)
    assert before is not None
    assert before["attestation_uid"] is None

    result = await anchor_block_to_eas(
        block_index=block_index,
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )
    assert result.success is True

    after = await get_attestation_status(test_db, block_index)
    assert after is not None
    assert after["attestation_uid"] == result.eas_attestation_uid
    assert after["on_chain"] is False


async def test_anchor_block_not_found(test_db: Any, eas_client: EasClient) -> None:
    """Anchoring a non-existent block returns not_found."""
    result = await anchor_block_to_eas(
        block_index=99999,
        auditor_username=AUDITOR_USERNAME,
        client=eas_client,
        db=test_db,
    )

    assert result.success is False
    assert result.reason == "not_found"
    assert "not found" in result.message.lower()
