"""Request models for FastAPI endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UsageData(BaseModel):
    """Usage data for calculation."""

    format: Literal["list", "dict", "csv"] = Field(
        default="list", description="Data format type"
    )
    data: list[float] | dict[str, float] | None = Field(
        default=None, description="Usage values"
    )
    start: datetime | None = Field(
        default=None, description="Start time for list format"
    )
    freq: Literal["15min", "1h", "1D"] = Field(
        default="1h", description="Time frequency"
    )


class BillingInputsRequest(BaseModel):
    """Billing inputs for calculation."""

    meter_phase: str | None = Field(
        default=None, description="Meter phase (single/three)"
    )
    meter_voltage_v: int | None = Field(default=None, description="Meter voltage")
    meter_ampere: float | None = Field(default=None, description="Meter amperage")
    contract_capacity_kw: float | None = Field(
        default=None, description="Contract capacity in kW"
    )
    contract_capacities: dict[str, float] | None = Field(
        default=None, description="Contract capacities by period"
    )
    power_factor: float | None = Field(
        default=None, description="Power factor percentage"
    )
    demand_kw: list[float] | None = Field(
        default=None, description="Demand data in kW"
    )
    billing_cycle_type: Literal["monthly", "odd_month", "even_month"] = Field(
        default="monthly", description="Billing cycle type"
    )


class CalculateRequest(BaseModel):
    """Request for single plan calculation."""

    plan_id: str = Field(..., description="Plan identifier")
    usage: UsageData = Field(..., description="Usage data")
    inputs: BillingInputsRequest = Field(
        default_factory=BillingInputsRequest, description="Billing inputs"
    )


class CompareRequest(BaseModel):
    """Request for comparing multiple plans."""

    plan_ids: list[str] = Field(..., description="Plan IDs to compare")
    usage: UsageData = Field(..., description="Usage data")
    shared_inputs: BillingInputsRequest = Field(
        default_factory=BillingInputsRequest,
        description="Shared billing inputs for all plans",
    )


class ValidateInputsRequest(BaseModel):
    """Request for validating billing inputs."""

    plan_id: str = Field(..., description="Plan identifier")
    inputs: BillingInputsRequest = Field(..., description="Billing inputs to validate")
