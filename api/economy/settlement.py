"""Bridge module for backwards-compatible imports of settlement logic."""

from server.market.service import calculate_settlement


def settle(
    units: int,
    price_idr: int = 40_000,
    fee_pct: int = 2,
    community_pct: int = 60,
    status: str = "VERIFIED",
) -> dict:
    breakdown = calculate_settlement(
        units=units,
        price_idr=price_idr,
        fee_pct=fee_pct,
        community_pct=community_pct,
        status=status,
    )
    return breakdown.model_dump()
