"""API tests for compare endpoint error handling."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


class TestCompareAPI:
    """Test compare API error handling."""

    def test_compare_all_invalid_plans_returns_400(self):
        """Test that all invalid plan_ids returns 400 with readable error."""
        request_data = {
            "plan_ids": ["invalid_plan_1", "invalid_plan_2", "nonexistent_plan"],
            "usage": {
                "data": [1.0, 2.0, 3.0],
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {},
        }

        response = client.post("/api/v1/calculate/compare", json=request_data)

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "failed to calculate" in data["detail"].lower()
        # Check that error includes the failed plan IDs
        assert "invalid_plan_1" in data["detail"] or "failed" in data["detail"].lower()

    def test_compare_partial_failure_includes_failed_plans(self):
        """Test that partial failures return success with failed_plans details."""
        # Get a valid plan first
        plans_response = client.get("/api/v1/plans")
        valid_plans = plans_response.json()["plans"]
        if not valid_plans:
            pytest.skip("No valid plans available")

        valid_plan_id = valid_plans[0]["id"]

        request_data = {
            "plan_ids": [valid_plan_id, "invalid_plan_xyz", "another_invalid"],
            "usage": {
                "data": [1.0, 2.0, 3.0, 4.0],
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {},
        }

        response = client.post("/api/v1/calculate/compare", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert "comparison" in data
        assert len(data["comparison"]) == 1
        assert data["comparison"][0]["plan_id"] == valid_plan_id
        assert "failed_plans" in data
        assert len(data["failed_plans"]) == 2
        # Verify failed plan details
        failed_ids = {fp["plan_id"] for fp in data["failed_plans"]}
        assert "invalid_plan_xyz" in failed_ids
        assert "another_invalid" in failed_ids
        # Check that error messages are present
        for fp in data["failed_plans"]:
            assert "error_type" in fp
            assert "error_message" in fp

    def test_compare_all_valid_plans_no_failures(self):
        """Test that all valid plans returns comparison without failed_plans."""
        plans_response = client.get("/api/v1/plans")
        valid_plans = plans_response.json()["plans"]
        if len(valid_plans) < 2:
            pytest.skip("Need at least 2 valid plans")

        # Use first 2 valid plans
        plan_ids = [p["id"] for p in valid_plans[:2]]

        request_data = {
            "plan_ids": plan_ids,
            "usage": {
                "data": [1.0, 2.0, 3.0, 4.0],
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {},
        }

        response = client.post("/api/v1/calculate/compare", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert len(data["comparison"]) == 2
        assert data["failed_plans"] == []
        # Check ranking
        assert data["comparison"][0]["rank"] == 1
        assert data["comparison"][1]["rank"] == 2
        assert data["cheapest_plan_id"] == data["comparison"][0]["plan_id"]

    def test_compare_empty_plan_list_returns_400(self):
        """Test that empty plan_ids list returns appropriate error."""
        request_data = {
            "plan_ids": [],
            "usage": {
                "data": [1.0],
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {},
        }

        response = client.post("/api/v1/calculate/compare", json=request_data)

        # Empty plan list should result in all plans failing
        assert response.status_code == 400

    def test_compare_single_valid_plan(self):
        """Test comparison with a single valid plan."""
        plans_response = client.get("/api/v1/plans")
        valid_plans = plans_response.json()["plans"]
        if not valid_plans:
            pytest.skip("No valid plans available")

        plan_id = valid_plans[0]["id"]

        request_data = {
            "plan_ids": [plan_id],
            "usage": {
                "data": [1.0, 2.0, 3.0],
                "start": "2025-07-01T00:00:00",
                "freq": "1h",
            },
            "shared_inputs": {},
        }

        response = client.post("/api/v1/calculate/compare", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert len(data["comparison"]) == 1
        assert data["comparison"][0]["rank"] == 1
        assert data["savings_vs_most_expensive"] == 0
        assert data["cheapest_plan_id"] == plan_id
