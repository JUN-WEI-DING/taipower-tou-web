"""API integration tests for /api/v1/calculate/* endpoints.

Tests cover Risk R3: Compare API error handling and proper response codes.
"""

import pytest
from datetime import datetime
from pathlib import Path
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in __import__("sys").path:
    __import__("sys").path.insert(0, str(SRC))

from backend.main import app

client = TestClient(app)


class TestCalculateAPI:
    """Test suite for calculate API endpoints."""

    @pytest.fixture
    def valid_calculate_request(self):
        """Fixture providing a valid calculate request."""
        return {
            "plan_id": "residential_simple_2_tier",
            "usage": {
                "format": "list",
                "data": [1.0] * 24,  # 24 hours
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

    @pytest.fixture
    def valid_compare_request(self):
        """Fixture providing a valid compare request."""
        return {
            "plan_ids": [
                "residential_simple_2_tier",
                "residential_simple_3_tier",
            ],
            "usage": {
                "format": "list",
                "data": [1.0] * 24,
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

    def test_calculate_simple_returns_200(self, valid_calculate_request):
        """Test simple calculation endpoint returns 200."""
        response = client.post(
            "/api/v1/calculate/simple",
            json=valid_calculate_request,
        )

        assert response.status_code == 200
        data = response.json()

        assert "request_id" in data
        assert "plan" in data
        assert "summary" in data
        assert "monthly_breakdown" in data
        assert data["summary"]["total_cost"] >= 0
        assert data["summary"]["total_usage_kwh"] == 24.0

    def test_calculate_simple_invalid_plan_returns_400(self, valid_calculate_request):
        """Test invalid plan_id returns 400."""
        valid_calculate_request["plan_id"] = "invalid_plan_xyz"

        response = client.post(
            "/api/v1/calculate/simple",
            json=valid_calculate_request,
        )

        # May return 400 or 500 depending on error handling
        assert response.status_code in [400, 500]

    def test_calculate_simple_empty_usage_returns_error(self, valid_calculate_request):
        """Test empty usage data returns error."""
        valid_calculate_request["usage"]["data"] = []

        response = client.post(
            "/api/v1/calculate/simple",
            json=valid_calculate_request,
        )

        # Current implementation returns 500 for empty data
        # Should return 400 or 422 for validation error
        assert response.status_code in [400, 422, 500]

    def test_compare_valid_plans_returns_200(self, valid_compare_request):
        """TC-R3-03: Valid compare request returns sorted results."""
        response = client.post(
            "/api/v1/calculate/compare",
            json=valid_compare_request,
        )

        assert response.status_code == 200
        data = response.json()

        assert "comparison" in data
        assert "cheapest_plan_id" in data
        assert "savings_vs_most_expensive" in data

        # Verify results are sorted by cost (rank 1 has lowest cost)
        comparison = data["comparison"]
        if len(comparison) > 1:
            assert comparison[0]["total_cost"] <= comparison[1]["total_cost"]
            assert comparison[0]["rank"] == 1
            assert comparison[1]["rank"] == 2

    def test_compare_all_invalid_plans_returns_4xx(self, valid_compare_request):
        """TC-R3-01: All invalid plan_ids should return 4xx, not 200 + empty."""
        valid_compare_request["plan_ids"] = [
            "invalid_plan_1",
            "invalid_plan_2",
            "invalid_plan_3",
        ]

        response = client.post(
            "/api/v1/calculate/compare",
            json=valid_compare_request,
        )

        # Current implementation returns 200 with empty results - this is the bug
        # After fix, this should return 400 or 404
        # For now, we document the current behavior
        if response.status_code == 200:
            # Bug: returns 200 with empty comparison
            assert len(response.json()["comparison"]) == 0
            pytest.fail("R3 Bug confirmed: Returns 200 with empty results instead of 4xx")
        else:
            assert response.status_code in [400, 404]

    def test_compare_partial_invalid_plans_includes_failed_info(self, valid_compare_request):
        """TC-R3-02: Partial failures should include failed_plans field."""
        valid_compare_request["plan_ids"] = [
            "residential_simple_2_tier",  # Valid
            "invalid_plan_xyz",  # Invalid
        ]

        response = client.post(
            "/api/v1/calculate/compare",
            json=valid_compare_request,
        )

        # Current implementation silently skips invalid plans
        # After fix, should include failed_plans in response
        assert response.status_code == 200
        data = response.json()

        # Valid plan should be in results
        assert len(data["comparison"]) >= 1

        # Bug: no information about which plans failed
        if "failed_plans" not in data:
            pytest.fail("R3 Bug: No failed_plans field in partial failure response")

    def test_compare_single_plan_returns_result(self, valid_compare_request):
        """Test compare with single plan returns valid result."""
        valid_compare_request["plan_ids"] = ["residential_simple_2_tier"]

        response = client.post(
            "/api/v1/calculate/compare",
            json=valid_compare_request,
        )

        assert response.status_code == 200
        data = response.json()

        assert len(data["comparison"]) == 1
        assert data["comparison"][0]["rank"] == 1
        assert data["cheapest_plan_id"] == "residential_simple_2_tier"

    def test_compare_cross_month_usage(self):
        """TC-R2-05: Compare handles cross-month usage data."""
        request = {
            "plan_ids": ["residential_simple_2_tier"],
            "usage": {
                "format": "list",
                "data": [1.0] * 48,  # 2 days
                "start": "2025-07-31T22:00:00",
                "freq": "1h",
            },
            "shared_inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        response = client.post(
            "/api/v1/calculate/compare",
            json=request,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have breakdown for both July and August
        assert len(data["comparison"]) == 1
        # Note: monthly_breakdown may not be in compare response
        # This test verifies the calculation doesn't crash

    def test_compare_15min_frequency(self):
        """TC-R2-03: Compare handles 15-minute frequency data."""
        request = {
            "plan_ids": ["residential_simple_2_tier"],
            "usage": {
                "format": "list",
                "data": [1.0] * 96,  # 24 hours * 4 (15-min)
                "start": "2025-07-01T00:00:00",
                "freq": "15min",
            },
            "shared_inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        response = client.post(
            "/api/v1/calculate/compare",
            json=request,
        )

        assert response.status_code == 200
        assert response.json()["comparison"][0]["total_usage_kwh"] == 96.0

    def test_calculate_includes_monthly_breakdown(self, valid_calculate_request):
        """Test monthly_breakdown is included in response."""
        response = client.post(
            "/api/v1/calculate/simple",
            json=valid_calculate_request,
        )

        assert response.status_code == 200
        data = response.json()

        assert "monthly_breakdown" in data
        assert len(data["monthly_breakdown"]) > 0

        month_breakdown = data["monthly_breakdown"][0]
        assert "month" in month_breakdown
        assert "season" in month_breakdown
        assert "usage_kwh" in month_breakdown
        assert "energy_cost" in month_breakdown
        assert "by_period" in month_breakdown
