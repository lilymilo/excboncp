// SPDX-License-Identifier: MIT
/**
 * ExcbonCP — EAS Attestation Smart Contract
 *
 * Part of Day 3 implementation (R7 — EAS Blockchain Attestation).
 *
 * This contract is the auditor-facing wrapper around the Ethereum Attestation
 * Service (EAS) on Base Sepolia.  It:
 *   1. registers the ExcbonCP `ParcelAttestation` schema,
 *   2. maintains an auditor whitelist, and
 *   3. anchors a local SHA-256 ledger block hash on-chain.
 *
 * Network: Base Sepolia Testnet (Chain ID 84532)
 * EAS:     v1.5 (https://base-sepolia.easscan.org)
 *
 * The interfaces below are the minimal EAS v1.5 surface used by this contract.
 * Keeping them inline makes the contract self-contained for review; the Day 4
 * Hardhat deployment can replace them with the official `eas-contracts`
 * interfaces without changing the ABI used by the Python client.
 */

pragma solidity ^0.8.19;

// ---------------------------------------------------------------------------
// Minimal EAS v1.5 interfaces
// ---------------------------------------------------------------------------

interface ISchemaRegistry {
    struct SchemaRecord {
        bytes32 uid;
        address resolver;
        bool revocable;
        string schema;
    }

    function register(
        string calldata schema,
        address resolver,
        bool revocable
    ) external returns (bytes32);

    function getSchema(bytes32 uid) external view returns (SchemaRecord memory);
}

interface IEAS {
    struct AttestationRequestData {
        address recipient;
        uint64 expirationTime;
        bool revocable;
        bytes32 refUID;
        bytes data;
        uint256 value;
    }

    struct AttestationRequest {
        bytes32 schema;
        AttestationRequestData data;
    }

    struct RevocationRequestData {
        bytes32 uid;
        uint256 value;
    }

    struct RevocationRequest {
        bytes32 schema;
        RevocationRequestData data;
    }

    function attest(AttestationRequest calldata request) external payable returns (bytes32);

    function revoke(RevocationRequest calldata request) external;

    event Attested(
        address indexed recipient,
        address indexed attester,
        bytes32 uid,
        bytes32 indexed schemaUID
    );

    event Revoked(
        address indexed recipient,
        address indexed attester,
        bytes32 uid,
        bytes32 indexed schemaUID
    );
}

// ---------------------------------------------------------------------------
// ExcbonCP attestation contract
// ---------------------------------------------------------------------------

contract ExcbonCPAttestation {
    /// EAS schema (canonical field list — no display name or whitespace).
    string public constant PARCEL_ATTESTATION_SCHEMA =
        "string parcelId,string parcelStatus,uint256 co2eMetricTons,"
        "bytes32 ledgerBlockHash,string metadataURI,address auditor";

    /// Contract administrator (deployer).
    address public immutable owner;

    /// EAS contract on Base Sepolia.
    IEAS public immutable eas;

    /// EAS Schema Registry on Base Sepolia.
    ISchemaRegistry public immutable schemaRegistry;

    /// Schema UID returned by the registry (zero until registered).
    bytes32 public schemaUID;

    /// Admin-managed auditor whitelist.
    mapping(address => bool) public trustedAttester;

    /// Replay protection: a ledger block hash may be anchored only once.
    mapping(bytes32 => bool) public attestedBlocks;

    /// Auditor recorded for each attestation UID (used for revocation).
    mapping(bytes32 => address) public attestationAuditor;

    event ParcelAttested(
        string indexed parcelId,
        string parcelStatus,
        uint256 co2eMetricTons,
        bytes32 ledgerBlockHash,
        string metadataURI,
        address indexed auditor,
        bytes32 indexed attestationUid
    );

    event AttesterGranted(address indexed auditor);
    event AttesterRevoked(address indexed auditor);
    event SchemaRegistered(bytes32 indexed schemaUID, string schema);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not admin");
        _;
    }

    modifier onlyAttester() {
        require(trustedAttester[msg.sender], "Not a trusted auditor");
        _;
    }

    constructor(address _eas, address _schemaRegistry) {
        require(_eas != address(0), "EAS address required");
        require(_schemaRegistry != address(0), "Schema registry required");
        owner = msg.sender;
        eas = IEAS(_eas);
        schemaRegistry = ISchemaRegistry(_schemaRegistry);
    }

    // -----------------------------------------------------------------------
    // Initialization and auditor management
    // -----------------------------------------------------------------------

    /**
     * Register the ExcbonCP schema.  Callable once by the contract admin.
     */
    function registerSchema() external onlyOwner returns (bytes32) {
        require(schemaUID == bytes32(0), "Schema already registered");

        schemaUID = schemaRegistry.register(
            PARCEL_ATTESTATION_SCHEMA,
            address(0), // no resolver
            true // revocable: a mistaken attestation can be withdrawn
        );

        emit SchemaRegistered(schemaUID, PARCEL_ATTESTATION_SCHEMA);
        return schemaUID;
    }

    function grantAttester(address auditor) external onlyOwner {
        require(auditor != address(0), "Auditor required");
        require(!trustedAttester[auditor], "Already trusted");

        trustedAttester[auditor] = true;
        emit AttesterGranted(auditor);
    }

    function revokeAttester(address auditor) external onlyOwner {
        require(trustedAttester[auditor], "Not trusted");

        trustedAttester[auditor] = false;
        emit AttesterRevoked(auditor);
    }

    // -----------------------------------------------------------------------
    // Attestation
    // -----------------------------------------------------------------------

    /**
     * Anchor a verified ledger block.
     *
     * Requirements:
     *  1. Caller must be a trusted auditor.
     *  2. Only VERIFIED parcels may be attested (contract.md §7).
     *  3. The ledger block hash must not have been attested before.
     *  4. CO2e must be positive.
     */
    function attest(
        string memory parcelId,
        string memory parcelStatus,
        uint256 co2eMetricTons,
        bytes32 ledgerBlockHash,
        string memory metadataURI,
        address auditor
    ) external onlyAttester returns (bytes32) {
        require(schemaUID != bytes32(0), "Schema not registered");
        require(bytes(parcelId).length > 0, "Parcel id required");
        require(
            keccak256(bytes(parcelStatus)) == keccak256(bytes("VERIFIED")),
            "Only VERIFIED parcels may be attested"
        );
        require(co2eMetricTons > 0, "CO2e required");
        require(!attestedBlocks[ledgerBlockHash], "Block already attested");
        require(auditor != address(0), "Auditor required");

        attestedBlocks[ledgerBlockHash] = true;

        bytes32 uid = eas.attest(
            IEAS.AttestationRequest({
                schema: schemaUID,
                data: IEAS.AttestationRequestData({
                    recipient: auditor,
                    expirationTime: 0, // never expires
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(
                        parcelId,
                        parcelStatus,
                        co2eMetricTons,
                        ledgerBlockHash,
                        metadataURI,
                        auditor
                    ),
                    value: 0
                })
            })
        );

        attestationAuditor[uid] = auditor;

        emit ParcelAttested(
            parcelId,
            parcelStatus,
            co2eMetricTons,
            ledgerBlockHash,
            metadataURI,
            auditor,
            uid
        );

        return uid;
    }

    /**
     * Revoke a previously created attestation.  The recorded auditor or the
     * contract admin may revoke.
     */
    function revoke(bytes32 attestationUid) external {
        address auditor = attestationAuditor[attestationUid];
        require(auditor != address(0), "Unknown attestation");
        require(msg.sender == auditor || msg.sender == owner, "Not authorized");

        eas.revoke(
            IEAS.RevocationRequest({
                schema: schemaUID,
                data: IEAS.RevocationRequestData({uid: attestationUid, value: 0})
            })
        );

        delete attestationAuditor[attestationUid];
    }

    // -----------------------------------------------------------------------
    // Verification
    // -----------------------------------------------------------------------

    function isAttested(bytes32 ledgerBlockHash) external view returns (bool) {
        return attestedBlocks[ledgerBlockHash];
    }

    function isAttester(address auditor) external view returns (bool) {
        return trustedAttester[auditor];
    }

    function getSchemaRoot() external view returns (bytes32) {
        return schemaUID;
    }
}
