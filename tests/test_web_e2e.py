"""End-to-end tests for the web workflow.

Tests cover the full user journey: upload CSV -> calculate -> display results.
This verifies Risk R2: Frontend should use parsed start/freq from API.
"""

import pytest
from pathlib import Path
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in __import__("sys").path:
    __import__("sys").path.insert(0, str(SRC))

from backend.main import app

client = TestClient(app)


class TestWebE2E:
    """End-to-end tests for the web workflow."""

    def test_e2e_upload_calculate_display_workflow(self):
        """TC-E2E-01: Full workflow - upload CSV, calculate, display results."""
        # Step 1: Upload CSV
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
2025-07-01 03:00,0.8
2025-07-01 04:00,0.8
2025-07-01 05:00,0.9
2025-07-01 06:00,1.5
2025-07-01 07:00,2.8
2025-07-01 08:00,3.5
2025-07-01 09:00,4.2
2025-07-01 10:00,4.5
2025-07-01 11:00,4.3
2025-07-01 12:00,3.8
2025-07-01 13:00,4.0
2025-07-01 14:00,4.2
2025-07-01 15:00,4.1
2025-07-01 16:00,3.9
2025-07-01 17:00,3.5
2025-07-01 18:00,3.2
2025-07-01 19:00,2.8
2025-07-01 20:00,2.5
2025-07-01 21:00,2.2
2025-07-01 22:00,1.8
2025-07-01 23:00,1.5
"""

        upload_response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("usage.csv", csv_content, "text/csv")},
        )

        assert upload_response.status_code == 200
        upload_data = upload_response.json()

        # Verify upload response contains parsed data
        assert "parsed" in upload_data
        parsed = upload_data["parsed"]
        assert "start" in parsed
        assert "freq" in parsed
        assert "data" in parsed

        # Step 2: Calculate using parsed data
        calculate_request = {
            "plan_id": "residential_simple_2_tier",
            "usage": {
                "format": "list",
                "data": parsed["data"],
                "start": parsed["start"],  # Using parsed start (R2 fix)
                "freq": parsed["freq"],     # Using parsed freq (R2 fix)
            },
            "inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        calculate_response = client.post(
            "/api/v1/calculate/simple",
            json=calculate_request,
        )

        assert calculate_response.status_code == 200
        result = calculate_response.json()

        # Step 3: Verify results are displayable
        assert "summary" in result
        assert "monthly_breakdown" in result
        assert result["summary"]["total_cost"] >= 0
        assert result["summary"]["total_usage_kwh"] > 0
        assert len(result["monthly_breakdown"]) > 0

    def test_e2e_compare_plans_workflow(self):
        """TC-E2E-02: Compare multiple plans workflow."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
2025-07-01 03:00,0.8
"""

        # Upload
        upload_response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("usage.csv", csv_content, "text/csv")},
        )

        assert upload_response.status_code == 200
        parsed = upload_response.json()["parsed"]

        # Compare
        compare_request = {
            "plan_ids": [
                "residential_simple_2_tier",
                "residential_simple_3_tier",
                "residential_non_tou",
            ],
            "usage": {
                "format": "list",
                "data": parsed["data"],
                "start": parsed["start"],
                "freq": parsed["freq"],
            },
            "shared_inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        compare_response = client.post(
            "/api/v1/calculate/compare",
            json=compare_request,
        )

        assert compare_response.status_code == 200
        result = compare_response.json()

        # Verify comparison results
        assert len(result["comparison"]) >= 2
        assert "cheapest_plan_id" in result
        assert result["comparison"][0]["total_cost"] <= result["comparison"][-1]["total_cost"]

    def test_e2e_cross_month_calculation(self):
        """TC-E2E-03: Verify calculation works across month boundary."""
        csv_content = """timestamp,usage_kwh
2025-07-31 22:00,1.2
2025-07-31 23:00,1.1
2025-08-01 00:00,1.0
2025-08-01 01:00,0.9
"""

        # Upload
        upload_response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("cross_month.csv", csv_content, "text/csv")},
        )

        assert upload_response.status_code == 200
        parsed = upload_response.json()["parsed"]

        # Calculate
        calculate_request = {
            "plan_id": "residential_simple_2_tier",
            "usage": {
                "format": "list",
                "data": parsed["data"],
                "start": parsed["start"],
                "freq": parsed["freq"],
            },
            "inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        calculate_response = client.post(
            "/api/v1/calculate/simple",
            json=calculate_request,
        )

        assert calculate_response.status_code == 200
        result = calculate_response.json()

        # Should handle both months correctly
        assert result["summary"]["total_usage_kwh"] == pytest.approx(4.2)

    def test_e2e_15min_frequency_data(self):
        """TC-E2E-04: Verify 15-minute frequency data works end-to-end."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,0.3
2025-07-01 00:15,0.3
2025-07-01 00:30,0.3
2025-07-01 00:45,0.3
2025-07-01 01:00,0.3
2025-07-01 01:15,0.3
2025-07-01 01:30,0.3
2025-07-01 01:45,0.3
"""

        # Upload
        upload_response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("15min.csv", csv_content, "text/csv")},
        )

        assert upload_response.status_code == 200
        parsed = upload_response.json()["parsed"]

        # Verify frequency detection
        assert parsed["freq"] == "15min"

        # Calculate
        calculate_request = {
            "plan_id": "residential_simple_2_tier",
            "usage": {
                "format": "list",
                "data": parsed["data"],
                "start": parsed["start"],
                "freq": parsed["freq"],
            },
            "inputs": {
                "meter_phase": "single",
                "meter_voltage_v": 110,
                "meter_ampere": 10,
            },
        }

        calculate_response = client.post(
            "/api/v1/calculate/simple",
            json=calculate_request,
        )

        assert calculate_response.status_code == 200
        result = calculate_response.json()

        # Total should be 2 hours * 4 readings * 0.3 = 2.4 kWh
        assert result["summary"]["total_usage_kwh"] == pytest.approx(2.4)

    def test_e2e_warning_display_workflow(self):
        """TC-E2E-05: Verify warnings are returned and can be displayed."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,-0.5
2025-07-01 02:00,0.9
2025-07-01 03:00,1.0
"""

        # Upload
        upload_response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("warnings.csv", csv_content, "text/csv")},
        )

        assert upload_response.status_code == 200
        data = upload_response.json()

        # Check for validation warnings
        assert "validation" in data
        validation = data["validation"]
        assert validation["valid"] is True
        assert len(validation["warnings"]) > 0
        assert any("negative" in w.lower() for w in validation["warnings"])


@pytest.fixture
def sample_csv_content():
    """Sample CSV for testing."""
    return """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
"""
