"""Calculations API endpoints."""

from fastapi import APIRouter, HTTPException

from backend.models.requests import CalculateRequest, CompareRequest
from backend.models.responses import CalculationResponse, ComparisonResponse
from backend.services.calculation_service import CalculationService

router = APIRouter(prefix="/api/v1/calculate", tags=["calculations"])


@router.post("/simple", response_model=CalculationResponse)
async def calculate_simple(request: CalculateRequest) -> CalculationResponse:
    """Calculate electricity bill for a single plan.

    Args:
        request: Calculation request with plan_id, usage data, and inputs

    Returns:
        CalculationResponse with detailed cost breakdown

    Raises:
        HTTPException: If calculation fails
    """
    try:
        return CalculationService.calculate(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@router.post("/compare", response_model=ComparisonResponse)
async def compare_plans(request: CompareRequest) -> ComparisonResponse:
    """Compare electricity costs across multiple plans.

    Args:
        request: Comparison request with plan_ids, usage data, and shared inputs

    Returns:
        ComparisonResponse with ranked plan costs

    Raises:
        HTTPException: If comparison fails
    """
    try:
        return CalculationService.compare(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
