"""Calculation service wrapping taipower_tou library."""

import uuid
from datetime import datetime
from typing import Any

import pandas as pd
from taipower_tou import (
    BillingInputs,
    calculate_bill,
    calculate_bill_simple,
    get_plan_requirements,
    monthly_breakdown,
    plan,
    plan_details,
    available_plans,
)
from taipower_tou.models import BillingCycleType

from backend.models.requests import BillingInputsRequest, CalculateRequest, CompareRequest
from backend.models.responses import (
    CalculationResponse,
    CalculationSummary,
    ComparisonResponse,
    FailedPlan,
    MonthlyBreakdown,
    PeriodCostBreakdown,
    PlanComparisonResult,
    PlanRequirementsResponse,
    PlanSummary,
)


class CalculationService:
    """Service for tariff calculations."""

    # Cache for plan summaries
    _plans_cache: dict[str, str] | None = None

    @classmethod
    def get_available_plans(cls) -> dict[str, str]:
        """Get all available plans.

        Returns:
            Dict mapping plan_id to Chinese name
        """
        if cls._plans_cache is None:
            cls._plans_cache = available_plans()
        return cls._plans_cache

    @classmethod
    def _get_plan_category(cls, plan_id: str) -> str:
        """Get category for a plan based on its ID.

        Args:
            plan_id: Plan identifier

        Returns:
            Category string
        """
        if "residential" in plan_id or "lighting" in plan_id:
            return "lighting"
        elif "low_voltage" in plan_id:
            return "low_voltage"
        elif "high_voltage" in plan_id and "extra_high" not in plan_id:
            return "high_voltage"
        elif "extra_high" in plan_id:
            return "extra_high_voltage"
        elif "ev" in plan_id:
            # EV plans follow voltage prefix
            if "high" in plan_id:
                return "high_voltage"
            return "low_voltage"
        else:
            return "lighting"

    @classmethod
    def _get_rate_structure(cls, plan_id: str) -> str:
        """Get rate structure type for a plan.

        Args:
            plan_id: Plan identifier

        Returns:
            "tou" for time-of-use plans, "tiered" for tiered rate plans
        """
        # Plans with explicit "non_tou" in ID are tiered
        # Also check for specific non-time plans for lighting/business
        if "non_tou" in plan_id or plan_id in (
            "lighting_non_business_tiered",
            "lighting_business_tiered",
        ):
            return "tiered"

        # All other plans are TOU (time-of-use)
        # This includes:
        # - Plans ending with "_tier" (time-of-use with tiered periods)
        # - Plans ending with "_stage" (three-stage time-of-use)
        # - EV plans
        # - High/extra high voltage power plans
        return "tou"

    @classmethod
    def get_plan_summaries(cls) -> list[PlanSummary]:
        """Get plan summaries for UI display.

        Returns:
            List of plan summaries
        """
        from taipower_tou.factory import _PLAN_NAME_MAP

        summaries = []
        for plan_id, name in _PLAN_NAME_MAP.items():
            category = cls._get_plan_category(plan_id)
            rate_structure = cls._get_rate_structure(plan_id)
            requirements = get_plan_requirements(plan_id)

            summaries.append(
                PlanSummary(
                    id=plan_id,
                    name=name,
                    category=category,
                    rate_structure=rate_structure,
                    requires_contract_capacity=requirements["requires_contract_capacity"],
                    requires_meter_spec=requirements["requires_meter_spec"],
                )
            )
        return summaries

    @classmethod
    def get_plan_requirements(cls, plan_id: str) -> PlanRequirementsResponse:
        """Get requirements for a specific plan.

        Args:
            plan_id: Plan identifier

        Returns:
            Plan requirements response
        """
        reqs = get_plan_requirements(plan_id)
        return PlanRequirementsResponse(
            plan_id=plan_id,
            requires_contract_capacity=reqs["requires_contract_capacity"],
            requires_meter_spec=reqs["requires_meter_spec"],
            valid_basic_fee_labels=reqs["valid_basic_fee_labels"],
            uses_basic_fee_formula=reqs["uses_basic_fee_formula"],
            formula_type=reqs["formula_type"],
        )

    @classmethod
    def _build_billing_inputs(
        cls, request_inputs: BillingInputsRequest
    ) -> BillingInputs:
        """Build BillingInputs from request.

        Args:
            request_inputs: Billing inputs from API request

        Returns:
            BillingInputs instance
        """
        kwargs = {}

        if request_inputs.meter_phase:
            kwargs["meter_phase"] = request_inputs.meter_phase
        if request_inputs.meter_voltage_v:
            kwargs["meter_voltage_v"] = request_inputs.meter_voltage_v
        if request_inputs.meter_ampere:
            kwargs["meter_ampere"] = request_inputs.meter_ampere
        if request_inputs.contract_capacity_kw:
            kwargs["contract_capacity_kw"] = request_inputs.contract_capacity_kw
        if request_inputs.contract_capacities:
            kwargs["contract_capacities"] = request_inputs.contract_capacities
        if request_inputs.power_factor:
            kwargs["power_factor"] = request_inputs.power_factor
        if request_inputs.demand_kw:
            kwargs["demand_kw"] = pd.Series(request_inputs.demand_kw)

        return BillingInputs(**kwargs)

    @classmethod
    def _parse_usage_data(
        cls, usage_data: Any, start: datetime | None, freq: str
    ) -> pd.Series:
        """Parse usage data into pandas Series.

        Args:
            usage_data: Usage data from request
            start: Start time for list format
            freq: Time frequency

        Returns:
            Pandas Series with DatetimeIndex
        """
        if isinstance(usage_data, pd.Series):
            return usage_data

        if isinstance(usage_data, dict):
            # Convert dict to Series
            timestamps = [
                datetime.fromisoformat(ts.replace("Z", "+00:00")) if isinstance(ts, str) else ts
                for ts in usage_data.keys()
            ]
            return pd.Series(list(usage_data.values()), index=pd.DatetimeIndex(timestamps))

        if isinstance(usage_data, list):
            if start is None:
                start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            index = pd.date_range(start=start, periods=len(usage_data), freq=freq)
            return pd.Series(usage_data, index=index)

        raise ValueError(f"Unsupported usage data format: {type(usage_data)}")

    @classmethod
    def calculate(cls, request: CalculateRequest) -> CalculationResponse:
        """Calculate bill for a single plan.

        Args:
            request: Calculation request

        Returns:
            Calculation response
        """
        # Get plan
        tariff_plan = plan(request.plan_id)

        # Parse usage data
        usage = cls._parse_usage_data(
            request.usage.data, request.usage.start, request.usage.freq
        )

        # Build billing inputs
        billing_inputs = cls._build_billing_inputs(request.inputs)

        # Calculate bill
        result_df = calculate_bill(
            usage,
            request.plan_id,
            inputs=billing_inputs,
        )

        # Get plan details for response
        all_plans = cls.get_available_plans()
        plan_name = all_plans.get(request.plan_id, request.plan_id)

        # Get monthly breakdown
        breakdown_df = monthly_breakdown(
            usage,
            request.plan_id,
            include_shares=True,
        )

        # Build monthly breakdown response
        monthly_breakdown_list = []

        # The breakdown_df already has month, season, period, usage_kwh, cost columns
        # Group by month to aggregate periods
        for month_ts, group in breakdown_df.groupby("month"):
            # Get month string from the first row's month column
            month_dt = pd.Timestamp(month_ts) if not isinstance(month_ts, pd.Timestamp) else month_ts
            month_str = month_dt.strftime("%Y-%m")

            # Get season from the first row (all rows in group have same season)
            season = group["season"].iloc[0]

            # Group by period
            period_costs = []
            for period_name, period_group in group.groupby("period", dropna=False):
                period_costs.append(
                    PeriodCostBreakdown(
                        period=str(period_name) if period_name else "unknown",
                        usage_kwh=float(period_group["usage_kwh"].sum()),
                        cost=float(period_group["cost"].sum()),
                    )
                )

            monthly_breakdown_list.append(
                MonthlyBreakdown(
                    month=month_str,
                    season=season,
                    usage_kwh=float(group["usage_kwh"].sum()),
                    energy_cost=float(group["cost"].sum()),
                    by_period=period_costs,
                )
            )

        # Build summary
        total_cost = float(result_df["total"].sum())
        total_usage = float(usage.sum())
        avg_rate = total_cost / total_usage if total_usage > 0 else 0

        # Get plan summary
        plan_summaries = cls.get_plan_summaries()
        plan_summary = next((p for p in plan_summaries if p.id == request.plan_id), None)
        if plan_summary is None:
            # Create minimal summary
            category = cls._get_plan_category(request.plan_id)
            rate_structure = cls._get_rate_structure(request.plan_id)
            plan_summary = PlanSummary(
                id=request.plan_id,
                name=plan_name,
                category=category,
                rate_structure=rate_structure,
                requires_contract_capacity=False,
                requires_meter_spec=False,
            )

        return CalculationResponse(
            request_id=str(uuid.uuid4()),
            plan=plan_summary,
            summary=CalculationSummary(
                total_cost=total_cost,
                total_usage_kwh=total_usage,
                average_rate=round(avg_rate, 2),
                period_start=usage.index.min() if len(usage) > 0 else None,
                period_end=usage.index.max() if len(usage) > 0 else None,
            ),
            monthly_breakdown=monthly_breakdown_list,
        )

    @classmethod
    def compare(cls, request: CompareRequest) -> ComparisonResponse:
        """Compare multiple plans.

        Args:
            request: Comparison request

        Returns:
            Comparison response

        Raises:
            ValueError: If all plans fail to calculate
        """
        # Parse usage data once
        usage = cls._parse_usage_data(
            request.usage.data, request.usage.start, request.usage.freq
        )

        # Build billing inputs once
        billing_inputs = cls._build_billing_inputs(request.shared_inputs)

        # Calculate for each plan
        results = []
        failed_plans = []

        for plan_id in request.plan_ids:
            try:
                tariff_plan = plan(plan_id)
                result_df = calculate_bill(
                    usage,
                    plan_id,
                    inputs=billing_inputs,
                )
                total_cost = float(result_df["total"].sum())
                total_usage = float(usage.sum())
                avg_rate = total_cost / total_usage if total_usage > 0 else 0

                # Get plan name
                all_plans = cls.get_available_plans()
                plan_name = all_plans.get(plan_id, plan_id)

                results.append(
                    {
                        "plan_id": plan_id,
                        "name": plan_name,
                        "total_cost": total_cost,
                        "total_usage_kwh": total_usage,
                        "average_rate": round(avg_rate, 2),
                    }
                )
            except Exception as e:
                # Track failed plans
                failed_plans.append(
                    FailedPlan(
                        plan_id=plan_id,
                        error_type=type(e).__name__,
                        error_message=str(e),
                    )
                )

        # If all plans failed, raise an error
        if not results:
            error_details = "\n".join(
                f"- {p.plan_id}: {p.error_message}" for p in failed_plans
            )
            raise ValueError(
                f"All {len(failed_plans)} plan(s) failed to calculate:\n{error_details}"
            )

        # Sort by cost
        results.sort(key=lambda x: x["total_cost"])

        # Build comparison response
        comparison_results = []
        for i, r in enumerate(results):
            comparison_results.append(
                PlanComparisonResult(
                    plan_id=r["plan_id"],
                    name=r["name"],
                    total_cost=r["total_cost"],
                    total_usage_kwh=r["total_usage_kwh"],
                    average_rate=r["average_rate"],
                    rank=i + 1,
                )
            )

        # Calculate savings
        if len(comparison_results) > 1:
            savings = comparison_results[-1].total_cost - comparison_results[0].total_cost
        else:
            savings = 0

        return ComparisonResponse(
            comparison=comparison_results,
            cheapest_plan_id=comparison_results[0].plan_id if comparison_results else "",
            savings_vs_most_expensive=round(savings, 2),
            failed_plans=failed_plans,
        )
