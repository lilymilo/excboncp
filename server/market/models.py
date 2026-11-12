"""ExcbonCP Central Server — Simulated carbon market Pydantic models."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class MarketOrderStatus(StrEnum):
    LISTED = "LISTED"
    MATCHED = "MATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class SettlementBreakdown(BaseModel):
    eligible: bool
    units: int
    gross: int
    fee: int
    net: int
    community: int
    manager: int
    label: str = "Simulasi, testnet"


class ParcelMarketResponse(BaseModel):
    parcel_id: str
    parcel_name: str
    area_hectares: float
    current_status: str
    vegetation_type: str
    baseline_ndvi: float
    estimated_co2e_tons: float
    settlement: SettlementBreakdown


class MarketOrderCreate(BaseModel):
    parcel_id: str = Field(..., min_length=1, max_length=100)
    seller_account: str = Field(..., min_length=1, max_length=100)
    buyer_account: str | None = Field(None, max_length=100)
    credit_amount: float = Field(..., gt=0)
    simulated_price_idr: float = Field(..., ge=0)
    zone_id: str | None = Field(None, max_length=100)
    order_status: MarketOrderStatus = MarketOrderStatus.LISTED


class MarketOrderResponse(BaseModel):
    id: str
    parcel_id: str
    seller_account: str
    buyer_account: str | None = None
    credit_amount: float
    simulated_price_idr: float
    zone_id: str | None = None
    order_status: str
    created_at: str
    settlement_breakdown: SettlementBreakdown | None = None
    label: str = "Simulasi, testnet"


class ZoneReportResponse(BaseModel):
    zone_id: str
    zone_name: str
    zone_type: str
    jurisdiction: str | None = None
    total_allocated_units: float
    total_expenditure_idr: int
    order_count: int
    orders: list[MarketOrderResponse]
    label: str = "Simulasi, testnet"
