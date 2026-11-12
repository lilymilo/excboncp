"""ExcbonCP Central Server — Carbon market simulation and settlement service."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime
from typing import Any

import aiosqlite

from server.market.models import (
    MarketOrderCreate,
    MarketOrderResponse,
    ParcelMarketResponse,
    SettlementBreakdown,
    ZoneReportResponse,
)

logger = logging.getLogger("excboncp.market.service")


def calculate_co2e(hectares: float, biomass_factor: float = 142.5) -> float:
    if hectares < 0:
        raise ValueError("Lahan tidak boleh bernilai negatif")
    # Static biomass factor; replace with Sentinel SAR biomass raster in production.
    return round(hectares * biomass_factor, 2)


def calculate_settlement(
    units: int,
    price_idr: int = 40_000,
    fee_pct: int = 2,
    community_pct: int = 60,
    status: str = "VERIFIED",
) -> SettlementBreakdown:
    if status != "VERIFIED":
        # All simulated units remain frozen if status is not verified.
        return SettlementBreakdown(
            eligible=False,
            units=0,
            gross=0,
            fee=0,
            net=0,
            community=0,
            manager=0,
            label="Simulasi, testnet",
        )

    gross = int(units * price_idr)
    fee = gross * fee_pct // 100
    net = gross - fee
    community = net * community_pct // 100
    manager = net - community

    return SettlementBreakdown(
        eligible=True,
        units=units,
        gross=gross,
        fee=fee,
        net=net,
        community=community,
        manager=manager,
        label="Simulasi, testnet",
    )


async def get_parcel_market_summary(
    db: aiosqlite.Connection, parcel_id: str, unit_price_idr: int = 40_000
) -> ParcelMarketResponse | None:
    resolved_id = "PARCEL-A" if parcel_id == "CBONCP-SRNPPI-JBR-01" else parcel_id
    async with db.execute(
        "SELECT id, name, area_hectares, vegetation_type, baseline_ndvi, current_status "
        "FROM parcels WHERE id = ? OR id = ?",
        (parcel_id, resolved_id),
    ) as cursor:
        row = await cursor.fetchone()

    if row is None:
        return None

    estimated_co2e = calculate_co2e(float(row["area_hectares"]))
    units = int(estimated_co2e)
    settlement = calculate_settlement(
        units=units,
        price_idr=unit_price_idr,
        status=row["current_status"],
    )

    return ParcelMarketResponse(
        parcel_id=row["id"],
        parcel_name=row["name"],
        area_hectares=float(row["area_hectares"]),
        current_status=row["current_status"],
        vegetation_type=row["vegetation_type"],
        baseline_ndvi=float(row["baseline_ndvi"]),
        estimated_co2e_tons=estimated_co2e,
        settlement=settlement,
    )


async def list_market_orders(
    db: aiosqlite.Connection,
    parcel_id: str | None = None,
    order_status: str | None = None,
) -> list[MarketOrderResponse]:
    query = (
        "SELECT id, parcel_id, seller_account, buyer_account, credit_amount, "
        "simulated_price_idr, zone_id, order_status, created_at "
        "FROM market_orders"
    )
    clauses: list[str] = []
    params: list[Any] = []

    if parcel_id:
        clauses.append("parcel_id = ?")
        params.append(parcel_id)
    if order_status:
        clauses.append("order_status = ?")
        params.append(order_status)

    if clauses:
        query += " WHERE " + " AND ".join(clauses)

    query += " ORDER BY created_at DESC"

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    orders: list[MarketOrderResponse] = []
    for row in rows:
        breakdown = calculate_settlement(
            units=int(row["credit_amount"]),
            price_idr=int(row["simulated_price_idr"]),
            status="VERIFIED",
        )
        orders.append(
            MarketOrderResponse(
                id=row["id"],
                parcel_id=row["parcel_id"],
                seller_account=row["seller_account"],
                buyer_account=row["buyer_account"],
                credit_amount=float(row["credit_amount"]),
                simulated_price_idr=float(row["simulated_price_idr"]),
                zone_id=row["zone_id"],
                order_status=row["order_status"],
                created_at=row["created_at"],
                settlement_breakdown=breakdown,
                label="Simulasi, testnet",
            )
        )
    return orders


async def create_market_order(
    db: aiosqlite.Connection, payload: MarketOrderCreate
) -> MarketOrderResponse:
    async with db.execute(
        "SELECT id, current_status FROM parcels WHERE id = ?",
        (payload.parcel_id,),
    ) as cursor:
        parcel = await cursor.fetchone()

    if parcel is None:
        raise ValueError(f"Parcel '{payload.parcel_id}' tidak ditemukan.")

    if parcel["current_status"] != "VERIFIED":
        raise ValueError(
            f"Lahan '{payload.parcel_id}' berstatus {parcel['current_status']}. "
            "Hanya lahan berstatus VERIFIED yang dapat ditransaksikan di pasar simulasi."
        )

    order_id = str(uuid.uuid4())
    now_utc = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

    await db.execute(
        """
        INSERT INTO market_orders (
            id, parcel_id, seller_account, buyer_account,
            credit_amount, simulated_price_idr, zone_id,
            order_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            order_id,
            payload.parcel_id,
            payload.seller_account,
            payload.buyer_account,
            payload.credit_amount,
            payload.simulated_price_idr,
            payload.zone_id,
            payload.order_status.value,
            now_utc,
        ),
    )
    await db.commit()

    breakdown = calculate_settlement(
        units=int(payload.credit_amount),
        price_idr=int(payload.simulated_price_idr),
        status="VERIFIED",
    )

    return MarketOrderResponse(
        id=order_id,
        parcel_id=payload.parcel_id,
        seller_account=payload.seller_account,
        buyer_account=payload.buyer_account,
        credit_amount=payload.credit_amount,
        simulated_price_idr=payload.simulated_price_idr,
        zone_id=payload.zone_id,
        order_status=payload.order_status.value,
        created_at=now_utc,
        settlement_breakdown=breakdown,
        label="Simulasi, testnet",
    )


async def get_zone_report(
    db: aiosqlite.Connection, zone_id: str
) -> ZoneReportResponse | None:
    """Generate receiver zone utilization and carbon order allocation report (Blueprint L5)."""
    db.row_factory = aiosqlite.Row

    async with db.execute(
        "SELECT id, name, type, jurisdiction FROM zones WHERE id = ?", (zone_id,)
    ) as cur:
        zone_row = await cur.fetchone()
        if not zone_row:
            return None

    orders: list[MarketOrderResponse] = []
    total_units = 0.0
    total_expenditure = 0

    async with db.execute(
        "SELECT id, parcel_id, seller_account, buyer_account, credit_amount, "
        "simulated_price_idr, zone_id, order_status, created_at "
        "FROM market_orders WHERE zone_id = ? ORDER BY created_at DESC",
        (zone_id,),
    ) as cur:
        rows = await cur.fetchall()
        for r in rows:
            amt = float(r["credit_amount"])
            price = float(r["simulated_price_idr"])
            total_units += amt
            total_expenditure += int(amt * price)

            breakdown = calculate_settlement(
                units=int(amt),
                price_idr=int(price),
                status="VERIFIED",
            )
            orders.append(
                MarketOrderResponse(
                    id=r["id"],
                    parcel_id=r["parcel_id"],
                    seller_account=r["seller_account"],
                    buyer_account=r["buyer_account"],
                    credit_amount=amt,
                    simulated_price_idr=price,
                    zone_id=r["zone_id"],
                    order_status=r["order_status"],
                    created_at=r["created_at"],
                    settlement_breakdown=breakdown,
                    label="Simulasi, testnet",
                )
            )

    return ZoneReportResponse(
        zone_id=zone_row["id"],
        zone_name=zone_row["name"],
        zone_type=zone_row["type"],
        jurisdiction=zone_row["jurisdiction"],
        total_allocated_units=round(total_units, 2),
        total_expenditure_idr=total_expenditure,
        order_count=len(orders),
        orders=orders,
        label="Simulasi, testnet",
    )
