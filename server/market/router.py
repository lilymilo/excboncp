"""ExcbonCP Central Server — Carbon market simulation router."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from server.database import get_db
from server.market.models import (
    MarketOrderCreate,
    MarketOrderResponse,
    ParcelMarketResponse,
)
from server.market.service import (
    create_market_order,
    get_parcel_market_summary,
    list_market_orders,
)

logger = logging.getLogger("excboncp.market.router")

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get(
    "/parcels/{parcel_id}/settlement",
    response_model=ParcelMarketResponse,
    summary="Get parcel market summary and settlement distribution",
)
async def get_parcel_settlement(
    parcel_id: str,
    unit_price_idr: int = Query(40_000, ge=0, description="Simulated price per unit in IDR"),
) -> ParcelMarketResponse:
    db = await get_db()
    summary = await get_parcel_market_summary(db, parcel_id, unit_price_idr=unit_price_idr)
    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel '{parcel_id}' not found.",
        )
    return summary


@router.get(
    "/orders",
    response_model=list[MarketOrderResponse],
    summary="List simulated carbon market orders",
)
async def get_orders(
    parcel_id: str | None = Query(None, description="Filter by parcel ID"),
    order_status: str | None = Query(None, description="Filter by order status"),
) -> list[MarketOrderResponse]:
    db = await get_db()
    return await list_market_orders(db, parcel_id=parcel_id, order_status=order_status)


@router.post(
    "/orders",
    response_model=MarketOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create simulated carbon market order",
)
async def create_order(payload: MarketOrderCreate) -> MarketOrderResponse:
    db = await get_db()
    try:
        return await create_market_order(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# Blueprint Model 8 contract path; registered last so it never shadows /orders.
@router.get("/{parcel_id}", response_model=ParcelMarketResponse, include_in_schema=False)
async def get_parcel_market_alias(
    parcel_id: str, unit_price_idr: int = Query(40_000, ge=0)
) -> ParcelMarketResponse:
    return await get_parcel_settlement(parcel_id, unit_price_idr=unit_price_idr)
