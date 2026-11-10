"""
ExcbonCP — EAS Smart Contract Deployment Helper.

Day 3/4 helper script to deploy contracts/EasProof.sol to Base Sepolia.

Usage:
    python scripts/deploy_eas.py

Environment variables:
    EVM_PRIVATE_KEY   — auditor private key (Base Sepolia)
    EVM_RPC_URL       — Base Sepolia RPC URL
    EVM_RPC_URL_PUBLIC — public fallback RPC
"""

from __future__ import annotations

import logging
import os
import sys

logger = logging.getLogger("excboncp.deploy.eas")

try:
    from web3 import Web3
except ImportError:
    print("ERROR: web3.py required. Install with: pip install web3", file=sys.stderr)
    sys.exit(1)


def main():
    private_key = os.environ.get("EVM_PRIVATE_KEY", "")
    rpc_url = os.environ.get("EVM_RPC_URL") or os.environ.get("EVM_RPC_URL_PUBLIC")

    if not private_key:
        print("ERROR: EVM_PRIVATE_KEY not set", file=sys.stderr)
        sys.exit(1)
    if not rpc_url:
        print("ERROR: EVM_RPC_URL or EVM_RPC_URL_PUBLIC not set", file=sys.stderr)
        sys.exit(1)

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    account = w3.eth.account.from_key(private_key)
    print(f"Connected to chain {w3.eth.chain_id}")
    print(f"Account: {account.address}")
    print(f"Balance: {w3.eth.get_balance(account.address)} wei")

    print("\nDeployment is a Day 4 milestone. Contract source:")
    print("  contracts/EasProof.sol")
    print("\nManual steps required:")
    print("  1. npm install --save-dev hardhat")
    print("  2. npm install @ethereum-attestation-service/eas-contracts")
    print("  3. Configure hardhat.config.js for Base Sepolia")
    print("  4. Deploy ExcbonCPAttestation(eas, schemaRegistry)")
    print("  5. Run npx hardhat run scripts/deploy.ts --network baseSepolia")

    print("\nNote: Keep EVM_SIMULATION_MODE=true until deployment is complete.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
