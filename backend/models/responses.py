"""Response models for FastAPI endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PlanSummary(BaseModel):
    """Summary of a tariff plan."""

    id: str = Field(..., description="Plan identifier")
    name: str = Field(..., description="Plan Chinese name")
    category: Literal["lighting", "low_voltage", "high_voltage", "extra_high_voltage"] = (
        Field(..., description="Plan category")
    )
    rate_structure: Literal["tou", "tiered"] = Field(
        ..., description="Rate structure type"
    )
    requires_contract_capacity: bool = Field(
        ..., description="Whether contract capacity is required"
    )
    requires_meter_spec: bool = Field(
        ..., description="Whether meter specs are required"
    )


class PlansListResponse(BaseModel):
    """Response for plans list endpoint."""

    plans: list[PlanSummary] = Field(..., description="Available plans")


class PlanRequirementsResponse(BaseModel):
    """Response for plan requirements endpoint."""

    plan_id: str = Field(..., description="Plan identifier")
    requires_contract_capacity: bool = Field(
        ..., description="Whether contract capacity is required"
    )
    requires_meter_spec: bool = Field(
        ..., description="Whether meter specs are required"
    )
    valid_basic_fee_labels: list[str] = Field(
        ..., description="Valid basic fee input labels"
    )
    uses_basic_fee_formula: bool = Field(
        ..., description="Whether formula-based calculation is used"
    )
    formula_type: str | None = Field(None, description="Formula type if used")


class PeriodCostBreakdown(BaseModel):
    """Cost breakdown by period."""

    period: str = Field(..., description="Period type (peak/off_peak/etc)")
    usage_kwh: float = Field(..., description="Usage in kWh")
    cost: float = Field(..., description="Cost in TWD")


class MonthlyBreakdown(BaseModel):
    """Monthly cost breakdown."""

    month: str = Field(..., description="Month identifier")
    season: Literal["summer", "non_summer"] = Field(..., description="Season type")
    usage_kwh: float = Field(..., description="Total usage in kWh")
    energy_cost: float = Field(..., description="Energy cost in TWD")
    by_period: list[PeriodCostBreakdown] = Field(
        ..., description="Breakdown by period"
    )


class CalculationSummary(BaseModel):
    """Summary of calculation results."""

    total_cost: float = Field(..., description="Total cost in TWD")
    total_usage_kwh: float = Field(..., description="Total usage in kWh")
    average_rate: float = Field(..., description="Average rate per kWh")
    period_start: datetime | None = Field(None, description="Period start")
    period_end: datetime | None = Field(None, description="Period end")


class CalculationResponse(BaseModel):
    """Response for calculation endpoint."""

    request_id: str = Field(..., description="Request ID for tracking")
    plan: PlanSummary = Field(..., description="Plan used for calculation")
    summary: CalculationSummary = Field(..., description="Calculation summary")
    monthly_breakdown: list[MonthlyBreakdown] = Field(
        ..., description="Monthly breakdown"
    )


class PlanComparisonResult(BaseModel):
    """Result for a single plan in comparison."""

    plan_id: str = Field(..., description="Plan identifier")
    name: str = Field(..., description="Plan Chinese name")
    total_cost: float = Field(..., description="Total cost in TWD")
    total_usage_kwh: float = Field(..., description="Total usage in kWh")
    average_rate: float = Field(..., description="Average rate per kWh")
    rank: int = Field(..., description="Cost rank (1=cheapest)")


class FailedPlan(BaseModel):
    """Information about a plan that failed to calculate."""

    plan_id: str = Field(..., description="Plan identifier")
    error_type: str = Field(..., description="Type of error (e.g., 'ValueError', 'KeyError')")
    error_message: str = Field(..., description="Human-readable error message")


class ComparisonResponse(BaseModel):
    """Response for comparison endpoint."""

    comparison: list[PlanComparisonResult] = Field(
        ..., description="Plan comparison results"
    )
    cheapest_plan_id: str = Field(..., description="Cheapest plan ID")
    savings_vs_most_expensive: float = Field(
        ..., description="Savings compared to most expensive plan"
    )
    failed_plans: list[FailedPlan] = Field(
        default_factory=list,
        description="Plans that failed to calculate",
    )


class PlanDetailsResponse(BaseModel):
    """Response for plan details endpoint."""

    id: str = Field(..., description="Plan identifier")
    name: str = Field(..., description="Plan Chinese name")
    category: str = Field(..., description="Plan category")
    rate_structure: Literal["tou", "tiered"] = Field(
        ..., description="Rate structure type"
    )
    requirements: PlanRequirementsResponse = Field(
        ..., description="Plan requirements"
    )
    description: str | None = Field(None, description="Plan description")


class APIError(BaseModel):
    """Error response model."""

    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: dict | None = Field(None, description="Additional error details")
