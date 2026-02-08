"""API integration tests for /api/v1/upload/csv endpoint.

Tests cover Risk R1: CSV parsing TypeError and validation.
"""

import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in __import__("sys").path:
    __import__("sys").path.insert(0, str(SRC))

from backend.main import app

client = TestClient(app)


class TestCSVUploadAPI:
    """Test suite for CSV upload API endpoint."""

    def test_upload_valid_csv_returns_200_with_statistics(self, sample_csv_content):
        """TC-R1-01: Valid CSV returns 200 with parsed statistics."""
        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("test.csv", sample_csv_content, "text/csv")},
        )

        assert response.status_code == 200
        data = response.json()

        assert "file_id" in data
        assert "parsed" in data
        assert "validation" in data

        parsed = data["parsed"]
        assert "data" in parsed
        assert "start" in parsed
        assert "freq" in parsed
        assert "statistics" in parsed
        assert "total_usage_kwh" in parsed["statistics"]
        assert parsed["statistics"]["total_usage_kwh"] > 0

    def test_upload_empty_csv_returns_400(self):
        """TC-R1-02: Empty CSV returns 400 error."""
        empty_csv = "timestamp,usage_kwh\n"

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("empty.csv", empty_csv, "text/csv")},
        )

        assert response.status_code == 400
        assert "No valid numeric usage values" in response.json()["detail"]

    def test_upload_non_numeric_usage_drops_rows_with_warning(self):
        """TC-R1-03: Non-numeric usage values are dropped with warning."""
        non_numeric_csv = """timestamp,usage_kwh
2025-07-01 00:00,abc
2025-07-01 01:00,1.2
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("invalid.csv", non_numeric_csv, "text/csv")},
        )

        # Current behavior: drops NaN rows and returns 200 with warning
        assert response.status_code == 200
        data = response.json()
        # Should have fewer records due to dropped row
        assert data["parsed"]["record_count"] == 1

    def test_upload_missing_timestamp_column_returns_400(self):
        """TC-R1-04: Missing timestamp column returns 400."""
        # Use a column name that won't match any timestamp pattern
        no_timestamp_csv = """dt,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("no_timestamp.csv", no_timestamp_csv, "text/csv")},
        )

        assert response.status_code == 400
        assert "timestamp" in response.json()["detail"].lower()

    def test_upload_missing_usage_column_returns_400(self):
        """TC-R1-04b: Missing usage column returns 400."""
        no_usage_csv = """timestamp,value
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("no_usage.csv", no_usage_csv, "text/csv")},
        )

        assert response.status_code == 400
        assert "usage" in response.json()["detail"].lower()

    def test_upload_with_warnings_returns_success(self):
        """TC-R1-05: CSV with null/negative values returns success with warnings."""
        # Note: NaN values are dropped during parsing, so we test with values that
        # will survive but trigger validation warnings
        csv_with_issues = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,0.0
2025-07-01 02:00,-0.5
2025-07-01 03:00,1.0
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("warnings.csv", csv_with_issues, "text/csv")},
        )

        assert response.status_code == 200
        data = response.json()
        validation = data["validation"]

        # Should have warning about negative values
        assert validation["valid"] is True
        assert any("negative" in w.lower() for w in validation["warnings"])

    def test_upload_non_csv_file_returns_400(self):
        """TC-R1-06: Non-CSV file returns 400."""
        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("test.txt", "not a csv", "text/plain")},
        )

        assert response.status_code == 400
        assert "Only CSV files are supported" in response.json()["detail"]

    def test_upload_detects_15min_frequency(self):
        """TC-R2-03: Verify 15-minute frequency detection."""
        csv_15min = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 00:15,1.1
2025-07-01 00:30,1.0
2025-07-01 00:45,0.9
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("15min.csv", csv_15min, "text/csv")},
        )

        assert response.status_code == 200
        assert response.json()["parsed"]["freq"] == "15min"

    def test_upload_detects_1h_frequency(self):
        """TC-R2-04: Verify 1-hour frequency detection."""
        csv_1h = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.1
2025-07-01 02:00,1.0
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("1h.csv", csv_1h, "text/csv")},
        )

        assert response.status_code == 200
        assert response.json()["parsed"]["freq"] == "1h"

    def test_upload_detects_cross_month_data(self):
        """TC-R2-05: Verify cross-month data handling."""
        csv_cross_month = """timestamp,usage_kwh
2025-07-31 22:00,1.2
2025-07-31 23:00,1.1
2025-08-01 00:00,1.0
2025-08-01 01:00,0.9
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("cross_month.csv", csv_cross_month, "text/csv")},
        )

        assert response.status_code == 200
        parsed = response.json()["parsed"]
        assert parsed["date_range"]["start"].startswith("2025-07")
        assert parsed["date_range"]["end"].startswith("2025-08")

    def test_validate_endpoint_works(self):
        """Test /validate endpoint returns preview data."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
"""

        response = client.post(
            "/api/v1/upload/validate",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )

        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert "preview" in data
        assert data["preview"]["columns"] == ["timestamp", "usage_kwh"]
        assert len(data["preview"]["rows"]) == 2


@pytest.fixture
def sample_csv_content():
    """Fixture providing sample CSV content for testing."""
    return """timestamp,usage_kwh
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
"""
