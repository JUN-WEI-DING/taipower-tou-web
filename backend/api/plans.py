"""Plans API endpoints."""

from fastapi import APIRouter, HTTPException

from backend.models.responses import (
    PlanDetailsResponse,
    PlanRequirementsResponse,
    PlansListResponse,
)
from backend.services.calculation_service import CalculationService

router = APIRouter(prefix="/api/v1/plans", tags=["plans"])


@router.get("", response_model=PlansListResponse)
async def list_plans() -> PlansListResponse:
    """Get list of all available tariff plans.

    Returns:
        PlansListResponse with all available plans
    """
    summaries = CalculationService.get_plan_summaries()
    return PlansListResponse(plans=summaries)


@router.get("/{plan_id}", response_model=PlanDetailsResponse)
async def get_plan_details(plan_id: str) -> PlanDetailsResponse:
    """Get detailed information about a specific plan.

    Args:
        plan_id: Plan identifier

    Returns:
        PlanDetailsResponse with plan details

    Raises:
        HTTPException: If plan not found
    """
    try:
        requirements = CalculationService.get_plan_requirements(plan_id)
        summaries = CalculationService.get_plan_summaries()
        plan_summary = next((p for p in summaries if p.id == plan_id), None)

        if plan_summary is None:
            raise HTTPException(status_code=404, detail=f"Plan not found: {plan_id}")

        return PlanDetailsResponse(
            id=plan_summary.id,
            name=plan_summary.name,
            category=plan_summary.category,
            rate_structure=plan_summary.rate_structure,
            requirements=requirements,
            description=None,  # Can be added later
        )
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Plan not found: {plan_id}")


@router.get("/{plan_id}/requirements", response_model=PlanRequirementsResponse)
async def get_plan_requirements(plan_id: str) -> PlanRequirementsResponse:
    """Get input requirements for a specific plan.

    Args:
        plan_id: Plan identifier

    Returns:
        PlanRequirementsResponse with required inputs

    Raises:
        HTTPException: If plan not found
    """
    try:
        return CalculationService.get_plan_requirements(plan_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Plan not found: {plan_id}")
