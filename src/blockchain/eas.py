"""
ExcbonCP — EAS (Ethereum Attestation Service) Attestation Client.

Day 3 implementation for R7: EAS Blockchain Attestation.

This client registers the ExcbonCP EAS schema on Base Sepolia and creates
on-chain attestations that anchor local SHA-256 ledger block hashes to the
blockchain.

Key design decisions:
- Dual-tier integrity: local SHA-256 chain + Base Sepolia EAS anchoring (ADR-006)
- Human auditor mandate: attestations require an auditor-role signature (ADR-006, contract.md §7)
- Simulation mode: EAS operations can be simulated for local testing without Sepolia ETH

Configuration from environment:
- EVM_PRIVATE_KEY — auditor EVM private key (Base Sepolia)
- EVM_RPC_URL — Base Sepolia RPC endpoint
- EAS_SCHEMA_REGISTRY — Schema Registry address (0x4200000000000000000000000000000000000020)
- EAS_ADDRESS — EAS contract address (0x4200000000000000000000000000000000000021)
- EVM_CHAIN_ID — 84532
- EVM_SIMULATION_MODE — true = simulate, false = live blockchain

The client is safe to import without ``web3`` installed: it falls back to
simulation mode and never sends a transaction unless a key and web3 are both
available.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import aiosqlite

from server.config import settings

logger = logging.getLogger("excboncp.blockchain.eas")

# ---------------------------------------------------------------------------
# EAS Network Configuration (Base Sepolia)
# ---------------------------------------------------------------------------

EVM_CHAIN_ID = int(os.environ.get("EVM_CHAIN_ID", str(settings.EVM_CHAIN_ID)))
EAS_SCHEMA_REGISTRY = os.environ.get("EAS_SCHEMA_REGISTRY", settings.EAS_SCHEMA_REGISTRY)
EAS_ADDRESS = os.environ.get("EAS_ADDRESS", settings.EAS_ADDRESS)
SIMULATION_MODE = (
    os.environ.get("EVM_SIMULATION_MODE", str(settings.EVM_SIMULATION_MODE)).lower() == "true"
)

EVM_RPC_URL = (
    os.environ.get("EVM_RPC_URL")
    or settings.EVM_RPC_URL
    or settings.EVM_RPC_URL_PUBLIC
    or "https://sepolia.base.org"
)

# EAS schema field list. EAS hashes the raw schema string, so this must not
# include a display name, spaces, or line breaks.
PARCEL_ATTESTATION_SCHEMA_NAME = "ParcelAttestation"
PARCEL_ATTESTATION_SCHEMA = (
    "string parcelId,string parcelStatus,uint256 co2eMetricTons,"
    "bytes32 ledgerBlockHash,string metadataURI,address auditor"
)


def _compute_schema_id(schema: str) -> str:
    """Return the EAS schema identifier.

    EAS uses ``keccak256(abi.encode(schema, resolver, revocable))`` on-chain.
    For the local (simulation) identifier we use ``keccak256(schema)`` because
    the resolver and revocability are fixed by this project.  When live
    registration succeeds, the real UID is read from the registry event.
    """
    try:
        from eth_utils import keccak

        return "0x" + keccak(text=schema).hex()
    except ImportError:  # pragma: no cover - only when web3 is not installed
        return hashlib.sha256(schema.encode()).hexdigest()


SCHEMA_ID = _compute_schema_id(PARCEL_ATTESTATION_SCHEMA)

logger.info(
    "EAS client initialized: simulation_mode=%s, chain_id=%s, rpc=%s",
    SIMULATION_MODE,
    EVM_CHAIN_ID,
    EVM_RPC_URL,
)


@dataclass
class AttestationResult:
    """Result of an EAS attestation operation."""

    success: bool
    attestation_uid: str | None
    transaction_hash: str | None
    ledger_block_hash: str
    parcel_id: str
    co2e_metric_tons: float
    status: str
    message: str
    on_chain: bool
    timestamp: str


# ---------------------------------------------------------------------------
# Minimal EAS ABIs (EAS v1.5 / Base Sepolia)
# ---------------------------------------------------------------------------

EAS_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "schema", "type": "bytes32"},
                    {
                        "components": [
                            {"internalType": "address", "name": "recipient", "type": "address"},
                            {
                                "internalType": "uint64",
                                "name": "expirationTime",
                                "type": "uint64",
                            },
                            {"internalType": "bool", "name": "revocable", "type": "bool"},
                            {"internalType": "bytes32", "name": "refUID", "type": "bytes32"},
                            {"internalType": "bytes", "name": "data", "type": "bytes"},
                            {"internalType": "uint256", "name": "value", "type": "uint256"},
                        ],
                        "internalType": "struct AttestationRequestData",
                        "name": "data",
                        "type": "tuple",
                    },
                ],
                "internalType": "struct AttestationRequest",
                "name": "request",
                "type": "tuple",
            }
        ],
        "name": "attest",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "recipient", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "attester", "type": "address"},
            {"indexed": False, "internalType": "bytes32", "name": "uid", "type": "bytes32"},
            {"indexed": True, "internalType": "bytes32", "name": "schemaUID", "type": "bytes32"},
        ],
        "name": "Attested",
        "type": "event",
    },
]

SCHEMA_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "schema", "type": "string"},
            {"internalType": "address", "name": "resolver", "type": "address"},
            {"internalType": "bool", "name": "revocable", "type": "bool"},
        ],
        "name": "register",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "uid", "type": "bytes32"}],
        "name": "getSchema",
        "outputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "uid", "type": "bytes32"},
                    {"internalType": "address", "name": "resolver", "type": "address"},
                    {"internalType": "bool", "name": "revocable", "type": "bool"},
                    {"internalType": "string", "name": "schema", "type": "string"},
                ],
                "internalType": "struct SchemaRecord",
                "name": "",
                "type": "tuple",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "uid", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "registerer", "type": "address"},
            {
                "components": [
                    {"internalType": "bytes32", "name": "uid", "type": "bytes32"},
                    {"internalType": "address", "name": "resolver", "type": "address"},
                    {"internalType": "bool", "name": "revocable", "type": "bool"},
                    {"internalType": "string", "name": "schema", "type": "string"},
                ],
                "indexed": False,
                "internalType": "struct ISchemaRecord",
                "name": "schema",
                "type": "tuple",
            },
        ],
        "name": "Registered",
        "type": "event",
    },
]


class EasClientError(Exception):
    """Error raised by the EAS client."""


# ---------------------------------------------------------------------------
# Web3 client wrapper
# ---------------------------------------------------------------------------


class EasClient:
    """Client for EAS operations on Base Sepolia.

    The client runs in simulation mode when ``EVM_SIMULATION_MODE=true``, when
    no private key is configured, or when ``web3`` is not installed.  In
    simulation mode it records attestations locally and never contacts the
    chain.
    """

    def __init__(self, private_key: str | None = None):
        """Initialize the EAS client.

        Args:
            private_key: EVM private key (auditor account). If None, read from
                ``EVM_PRIVATE_KEY`` / application settings.
        """
        self.private_key = (
            private_key or os.environ.get("EVM_PRIVATE_KEY", "") or settings.EVM_PRIVATE_KEY
        )
        self._simulation = SIMULATION_MODE
        self.w3: Any = None
        self.account: Any = None
        self.eas_contract: Any = None
        self.schema_registry_contract: Any = None
        self.schema_id = SCHEMA_ID

        key_ok = self._validate_private_key()
        if not key_ok and not self._simulation:
            logger.warning(
                "EVM_PRIVATE_KEY is missing or malformed; forcing EAS simulation mode. "
                "Use 0x + 64 hex characters to enable live attestations."
            )
            self._simulation = True

        if not self.private_key or not key_ok:
            self._simulation = True
        elif not self._simulation:
            self._connect_live()
        else:
            logger.info("EAS running in simulation mode (no blockchain transaction will be sent).")

    def _validate_private_key(self) -> bool:
        """Return True only for a well-formed ``0x`` + 32-byte hex key."""
        if not self.private_key:
            return False
        if len(self.private_key) != 66 or not self.private_key.lower().startswith("0x"):
            return False
        try:
            int(self.private_key[2:], 16)
        except ValueError:
            return False
        return True

    def _connect_live(self) -> None:
        """Prepare a live Web3 connection. Blocking calls are kept at startup."""
        try:
            from eth_account import Account
            from web3 import Web3
        except ImportError:
            logger.warning(
                "web3.py not installed; EAS will run in simulation mode. "
                "Install with: pip install 'web3>=8.0.0'"
            )
            self._simulation = True
            return

        try:
            rpc_url = EVM_RPC_URL
            if "YOUR_API_KEY" in rpc_url or not rpc_url:
                logger.info(
                    "EVM_RPC_URL is a placeholder; using public RPC %s",
                    settings.EVM_RPC_URL_PUBLIC,
                )
                rpc_url = settings.EVM_RPC_URL_PUBLIC

            self.w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 20}))
            if not self.w3.is_connected():
                logger.warning("Primary RPC %s not connected; trying public fallback...", rpc_url)
                self.w3 = Web3(
                    Web3.HTTPProvider(settings.EVM_RPC_URL_PUBLIC, request_kwargs={"timeout": 20})
                )
            if not self.w3.is_connected():
                logger.warning("No Base Sepolia RPC reachable; using simulation mode.")
                self._simulation = True
                self.w3 = None
                return

            chain_id = self.w3.eth.chain_id
            if chain_id != EVM_CHAIN_ID:
                logger.warning(
                    "RPC reports chain_id=%s but EVM_CHAIN_ID=%s. Refusing live mode.",
                    chain_id,
                    EVM_CHAIN_ID,
                )
                self._simulation = True
                self.w3 = None
                return

            self.account = Account.from_key(self.private_key)
            self.eas_contract = self.w3.eth.contract(address=EAS_ADDRESS, abi=EAS_ABI)
            self.schema_registry_contract = self.w3.eth.contract(
                address=EAS_SCHEMA_REGISTRY, abi=SCHEMA_REGISTRY_ABI
            )
            on_chain_uid = os.environ.get(
                "EAS_SCHEMA_UID",
                "0x64e443d45df4a77a844017cbf7c08d315f93f55dce247c083ebfa75686e37996",
            )
            if on_chain_uid:
                self.schema_id = on_chain_uid
            logger.info(
                "EAS client connected to Base Sepolia. Account: %s | Chain ID: %s | Schema UID: %s",
                self.account.address,
                chain_id,
                self.schema_id,
            )
        except Exception as exc:  # pragma: no cover - depends on external RPC
            logger.warning("Could not initialise live EAS client (%s); using simulation mode.", exc)
            self._simulation = True
            self.w3 = None
            self.account = None

    # ---------------------------------------------------------------------------
    # Schema management
    # ---------------------------------------------------------------------------

    async def register_schema(self, db: aiosqlite.Connection | None = None) -> dict[str, Any]:
        """Register the ExcbonCP schema, idempotently.

        In simulation mode this writes a local ``eas_registrations`` row.  In
        live mode it skips the transaction when the schema is already recorded
        locally, otherwise it submits a registry transaction and reads the
        resulting schema UID from the ``Registered`` event.
        """
        already_registered = await self._local_registration_exists(db)
        if already_registered:
            self.schema_id = already_registered["schema_id"]
            return {
                "registered": True,
                "schema_id": already_registered["schema_id"],
                "schema_name": PARCEL_ATTESTATION_SCHEMA_NAME,
                "schema": PARCEL_ATTESTATION_SCHEMA,
                "transaction_hash": already_registered["transaction_hash"],
                "message": "Schema already registered (local record).",
            }

        if self._simulation:
            await self._record_registration(db, self.schema_id, None)
            logger.info(
                "Simulation: registered schema '%s' locally", PARCEL_ATTESTATION_SCHEMA_NAME
            )
            return {
                "registered": True,
                "schema_id": self.schema_id,
                "schema_name": PARCEL_ATTESTATION_SCHEMA_NAME,
                "schema": PARCEL_ATTESTATION_SCHEMA,
                "transaction_hash": None,
                "message": "Schema registered (simulation mode).",
            }

        try:
            tx_hash = await asyncio.to_thread(self._send_register_transaction)
            receipt = await asyncio.to_thread(self._wait_for_receipt, tx_hash)
            if receipt.status != 1:
                raise EasClientError(f"Schema registration transaction failed ({tx_hash}).")

            self.schema_id = self._extract_schema_uid(receipt) or self.schema_id
            await self._record_registration(db, self.schema_id, tx_hash)
            logger.info("EAS schema registered on-chain. Tx: %s | UID: %s", tx_hash, self.schema_id)
            return {
                "registered": True,
                "schema_id": self.schema_id,
                "schema_name": PARCEL_ATTESTATION_SCHEMA_NAME,
                "schema": PARCEL_ATTESTATION_SCHEMA,
                "transaction_hash": tx_hash,
                "message": "Schema registered on Base Sepolia.",
            }
        except Exception as exc:
            logger.exception("Failed to register EAS schema")
            return {
                "registered": False,
                "schema_id": self.schema_id,
                "schema_name": PARCEL_ATTESTATION_SCHEMA_NAME,
                "schema": PARCEL_ATTESTATION_SCHEMA,
                "transaction_hash": None,
                "error": str(exc),
                "message": f"Schema registration failed: {exc}",
            }

    async def get_schema_registered(self) -> bool:
        """Return whether the local client has a recorded schema."""
        if self._simulation:
            return False
        try:
            result = await asyncio.to_thread(
                self.schema_registry_contract.functions.getSchema(self._schema_bytes32()).call
            )
            return bool(result and result[0] != bytes(32))
        except Exception as exc:  # pragma: no cover - external RPC
            logger.warning("Could not check schema registration: %s", exc)
            return False

    async def _local_registration_exists(
        self, db: aiosqlite.Connection | None
    ) -> dict[str, Any] | None:
        if db is None:
            return None
        cursor = await db.execute(
            "SELECT schema_id, transaction_hash FROM eas_registrations "
            "WHERE schema_name = ? AND network = ? ORDER BY registered_at DESC LIMIT 1",
            (PARCEL_ATTESTATION_SCHEMA_NAME, self._network_label()),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return {"schema_id": row[0], "transaction_hash": row[1]}

    async def _record_registration(
        self,
        db: aiosqlite.Connection | None,
        schema_id: str,
        tx_hash: str | None,
    ) -> None:
        if db is None:
            return
        await db.execute(
            "INSERT OR IGNORE INTO eas_registrations "
            "(schema_id, schema_name, transaction_hash, network, registered_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                schema_id,
                PARCEL_ATTESTATION_SCHEMA_NAME,
                tx_hash,
                self._network_label(),
                datetime.now(UTC).isoformat(),
            ),
        )
        await db.commit()

    def _network_label(self) -> str:
        """Distinguish simulated registrations from live Base Sepolia ones."""
        mode = "simulation" if self._simulation else "base-sepolia"
        return f"{mode}:{EVM_CHAIN_ID}"

    def _send_register_transaction(self) -> str:  # pragma: no cover - external RPC
        registry = self.schema_registry_contract.functions.register(
            PARCEL_ATTESTATION_SCHEMA,
            "0x0000000000000000000000000000000000000000",
            True,
        )
        tx = registry.build_transaction(self._base_tx_options())
        signed = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()

    def _extract_schema_uid(self, receipt: Any) -> str | None:  # pragma: no cover - external RPC
        try:
            events = self.schema_registry_contract.events.Registered().process_receipt(receipt)
            if events:
                return "0x" + bytes(events[0]["args"]["uid"]).hex()
        except Exception as exc:
            logger.warning("Could not parse schema registration event: %s", exc)
        if hasattr(receipt, "logs") and receipt.logs:
            for log in receipt.logs:
                topics = getattr(log, "topics", [])
                if len(topics) >= 2:
                    return "0x" + bytes(topics[1]).hex()
        return None

    def _schema_bytes32(self) -> bytes:
        """Convert the stored schema UID to 32 bytes."""
        raw = bytes.fromhex(self.schema_id.removeprefix("0x"))
        if len(raw) != 32:
            raise EasClientError(f"Invalid schema UID: {self.schema_id!r}")
        return raw

    # ---------------------------------------------------------------------------
    # Attestation
    # ---------------------------------------------------------------------------

    async def attest(
        self,
        parcel_id: str,
        co2e_metric_tons: float,
        ledger_block_hash: str,
        status: str = "VERIFIED",
        auditor_address: str | None = None,
        auditor_id: str | None = None,
        metadata_uri: str | None = None,
        db: aiosqlite.Connection | None = None,
    ) -> AttestationResult:
        """Create an EAS attestation anchoring a local ledger block.

        Requirements:
        - Only ``VERIFIED`` parcels may be attested (contract.md §7)
        - CO2e must be positive
        - The ledger block hash must not have been attested before
        - In live mode, the auditor address must match the signing account
        """
        block_hash = ledger_block_hash
        timestamp = datetime.now(UTC).isoformat()

        validation_error = await self._validate_attestation(
            parcel_id, co2e_metric_tons, block_hash, status, db
        )
        if validation_error is not None:
            return AttestationResult(
                success=False,
                attestation_uid=None,
                transaction_hash=None,
                ledger_block_hash=block_hash,
                parcel_id=parcel_id,
                co2e_metric_tons=co2e_metric_tons,
                status=status,
                message=validation_error,
                on_chain=False,
                timestamp=timestamp,
            )

        co2e_wei = int(round(co2e_metric_tons * 1e18))
        signer_address = auditor_address or (self.account.address if self.account else None)

        if self._simulation:
            fake_uid = "0x" + secrets.token_hex(32)
            fake_tx = "0x" + secrets.token_hex(32)
            logger.info(
                "SIMULATION: attested parcel=%s co2e=%s block=%s uid=%s",
                parcel_id,
                co2e_wei,
                block_hash,
                fake_uid,
            )
            await self._record_attestation(
                db,
                parcel_id=parcel_id,
                block_hash=block_hash,
                eas_uid=fake_uid,
                tx_hash=fake_tx,
                auditor_id=auditor_id,
                auditor_address=signer_address,
                attested_at=timestamp,
                on_chain=False,
            )
            return AttestationResult(
                success=True,
                attestation_uid=fake_uid,
                transaction_hash=fake_tx,
                ledger_block_hash=block_hash,
                parcel_id=parcel_id,
                co2e_metric_tons=co2e_metric_tons,
                status=status,
                message="Attestation simulated on Base Sepolia (no real gas cost).",
                on_chain=False,
                timestamp=timestamp,
            )

        try:  # pragma: no cover - requires funded Base Sepolia account
            if self.account is None:
                raise EasClientError("EAS client is not connected to a signer account.")
            if signer_address and signer_address.lower() != self.account.address.lower():
                raise EasClientError(
                    "Auditor address does not match the configured signing account."
                )

            encoded_data = self._encode_attestation_data(
                parcel_id, status, co2e_wei, block_hash, metadata_uri, self.account.address
            )
            tx_hash = await asyncio.to_thread(
                self._send_attest_transaction, encoded_data, self.account.address
            )
            receipt = await asyncio.to_thread(self._wait_for_receipt, tx_hash)
            if receipt.status != 1:
                raise EasClientError(f"Attestation transaction failed ({tx_hash}).")

            attestation_uid = self._extract_attestation_uid(receipt) or tx_hash
            await self._record_attestation(
                db,
                parcel_id=parcel_id,
                block_hash=block_hash,
                eas_uid=attestation_uid,
                tx_hash=tx_hash,
                auditor_id=auditor_id,
                auditor_address=self.account.address,
                attested_at=timestamp,
                on_chain=True,
            )
            logger.info("EAS attestation sent. Tx: %s | UID: %s", tx_hash, attestation_uid)
            return AttestationResult(
                success=True,
                attestation_uid=attestation_uid,
                transaction_hash=tx_hash,
                ledger_block_hash=block_hash,
                parcel_id=parcel_id,
                co2e_metric_tons=co2e_metric_tons,
                status=status,
                message="Attestation anchored to Base Sepolia.",
                on_chain=True,
                timestamp=timestamp,
            )
        except Exception as exc:
            logger.exception("Failed to create EAS attestation")
            return AttestationResult(
                success=False,
                attestation_uid=None,
                transaction_hash=None,
                ledger_block_hash=block_hash,
                parcel_id=parcel_id,
                co2e_metric_tons=co2e_metric_tons,
                status=status,
                message=f"Attestation failed: {exc}",
                on_chain=False,
                timestamp=timestamp,
            )

    async def _validate_attestation(
        self,
        parcel_id: str,
        co2e_metric_tons: float,
        ledger_block_hash: str,
        status: str,
        db: aiosqlite.Connection | None,
    ) -> str | None:
        """Return an error message when an attestation must be rejected."""
        if not parcel_id or not parcel_id.strip():
            return "Parcel id is required."
        if status != "VERIFIED":
            return f"Only VERIFIED parcels may be attested (received {status})."
        if co2e_metric_tons <= 0:
            return "CO2e metric tons must be greater than zero."
        raw_hash = ledger_block_hash.removeprefix("0x")
        if len(raw_hash) != 64:
            return "Ledger block hash must be a 32-byte SHA-256 hex string."
        try:
            bytes.fromhex(raw_hash)
        except ValueError:
            return "Ledger block hash is not valid hexadecimal."

        if db is not None:
            cursor = await db.execute(
                "SELECT eas_uid FROM attestations WHERE block_hash = ? LIMIT 1",
                (ledger_block_hash,),
            )
            row = await cursor.fetchone()
            if row is not None:
                return f"Ledger block already attested (eas_uid={row[0]})."
        return None

    async def _record_attestation(
        self,
        db: aiosqlite.Connection | None,
        *,
        parcel_id: str,
        block_hash: str,
        eas_uid: str,
        tx_hash: str,
        auditor_id: str | None,
        auditor_address: str | None,
        attested_at: str,
        on_chain: bool,
    ) -> None:
        if db is None:
            return
        if not auditor_id:
            raise EasClientError("attestations.auditor_id is required (users.id of the auditor).")
        await db.execute(
            "INSERT INTO attestations "
            "(id, parcel_id, block_hash, eas_uid, tx_hash, schema_uid, auditor_id, on_chain, attested_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                uuid.uuid4().hex,
                parcel_id,
                block_hash,
                eas_uid,
                tx_hash,
                self.schema_id,
                auditor_id,
                1 if on_chain else 0,
                attested_at,
            ),
        )
        await db.commit()
        logger.info(
            "Recorded attestation for parcel=%s block=%s auditor=%s (wallet=%s)",
            parcel_id,
            block_hash,
            auditor_id,
            auditor_address,
        )

    def _base_tx_options(self) -> dict[str, Any]:  # pragma: no cover - external RPC
        return {
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address, "pending"),
            "chainId": EVM_CHAIN_ID,
        }

    def _send_attest_transaction(  # pragma: no cover - external RPC
        self, encoded_data: bytes, recipient: str
    ) -> str:
        request = (
            self._schema_bytes32(),
            (
                recipient,
                0,  # expirationTime: never
                True,  # revocable (auditors may revoke a mistaken attestation)
                bytes(32),  # refUID
                encoded_data,
                0,  # value
            ),
        )
        tx = self.eas_contract.functions.attest(request).build_transaction(
            {**self._base_tx_options(), "gas": 350_000}
        )
        signed = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()

    def _wait_for_receipt(self, tx_hash: str) -> Any:  # pragma: no cover - external RPC
        return self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

    def _extract_attestation_uid(
        self, receipt: Any
    ) -> str | None:  # pragma: no cover - external RPC
        try:
            events = self.eas_contract.events.Attested().process_receipt(receipt)
            if events:
                return "0x" + bytes(events[0]["args"]["uid"]).hex()
        except Exception as exc:
            logger.warning("Could not parse EAS Attested event: %s", exc)
        if hasattr(receipt, "logs") and receipt.logs:
            for log in receipt.logs:
                data = getattr(log, "data", b"")
                if len(data) >= 32:
                    return "0x" + bytes(data[:32]).hex()
        return None

    def _encode_attestation_data(
        self,
        parcel_id: str,
        status: str,
        co2e_wei: int,
        ledger_block_hash: str,
        metadata_uri: str | None,
        auditor_address: str,
    ) -> bytes:
        """ABI-encode the schema fields in declaration order."""
        try:
            from web3 import Web3
        except ImportError as exc:  # pragma: no cover - live mode requires web3
            raise EasClientError("web3.py is required to encode attestation data.") from exc

        block_hash_bytes = bytes.fromhex(ledger_block_hash.removeprefix("0x"))
        return Web3().codec.encode(
            ["string", "string", "uint256", "bytes32", "string", "address"],
            [
                parcel_id,
                status,
                co2e_wei,
                block_hash_bytes,
                metadata_uri or "",
                auditor_address,
            ],
        )

    @property
    def simulation_mode(self) -> bool:
        """Whether this client is simulating EAS operations."""
        return self._simulation


# ---------------------------------------------------------------------------
# Singleton instance (created lazily)
# ---------------------------------------------------------------------------

_eas_client_instance: EasClient | None = None


def get_eas_client(private_key: str | None = None) -> EasClient:
    """Get or create the process-wide EAS client."""
    global _eas_client_instance
    if _eas_client_instance is None:
        _eas_client_instance = EasClient(private_key=private_key)
    return _eas_client_instance


def reset_eas_client() -> None:
    """Discard the singleton (used by tests and after config changes)."""
    global _eas_client_instance
    _eas_client_instance = None
