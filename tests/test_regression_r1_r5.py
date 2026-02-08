"""Regression test suite for R1-R5 fixes.

This suite verifies that all risk fixes are working correctly.
Run after all fixes are implemented to confirm resolution.
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


class TestRegressionR1_CSVParserTypeError:
    """Regression tests for R1: CSV Parser TypeError fix."""

    def test_r1_csv_parser_no_typeerror_on_valid_data(self):
        """R1 Regression: Valid CSV should not raise TypeError."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )

        assert response.status_code == 200
        parsed = response.json()["parsed"]
        assert "total_usage_kwh" in parsed["statistics"]
        assert parsed["statistics"]["total_usage_kwh"] == pytest.approx(3.1)

    def test_r1_sample_csv_file_works(self):
        """R1 Regression: examples/sample_usage_data.csv should parse successfully."""
        sample_csv_path = ROOT / "examples" / "sample_usage_data.csv"

        if not sample_csv_path.exists():
            pytest.skip("sample_usage_data.csv not found")

        with open(sample_csv_path, "rb") as f:
            response = client.post(
                "/api/v1/upload/csv",
                files={"file": ("sample_usage_data.csv", f, "text/csv")},
            )

        assert response.status_code == 200
        parsed = response.json()["parsed"]
        assert parsed["statistics"]["total_usage_kwh"] > 0
        assert parsed["record_count"] > 0


class TestRegressionR2_FrontendUsesAPIResponse:
    """Regression tests for R2: Frontend should use parsed start/freq from API."""

    def test_r2_upload_response_contains_start_and_freq(self):
        """R2 Regression: Upload API must return actual start and freq."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
"""

        response = client.post(
            "/api/v1/upload/csv",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )

        assert response.status_code == 200
        parsed = response.json()["parsed"]

        # Must include the actual start time from CSV
        assert "start" in parsed
        assert parsed["start"] == "2025-07-01T00:00:00"

        # Must include detected frequency
        assert "freq" in parsed
        assert parsed["freq"] == "1h"


class TestRegressionR3_CompareAPIErrorHandling:
    """Regression tests for R3: Compare API should not return 200 on all failures."""

    def test_r3_all_invalid_plans_returns_4xx_not_200(self):
        """R3 Regression: All invalid plans should return 4xx, not 200 + empty."""
        request = {
            "plan_ids": ["plan_x", "plan_y", "plan_z"],
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

        response = client.post(
            "/api/v1/calculate/compare",
            json=request,
        )

        # Should NOT return 200 with empty results
        # After fix: should return 400 or 404
        if response.status_code == 200:
            data = response.json()
            if len(data.get("comparison", [])) == 0:
                pytest.fail(
                    "R3 NOT FIXED: Returns 200 with empty comparison. "
                    "Should return 4xx when all plans fail."
                )

        assert response.status_code in [400, 404], (
            f"Expected 4xx for all invalid plans, got {response.status_code}"
        )

    def test_r3_partial_failures_include_failed_plans_field(self):
        """R3 Regression: Partial failures should include failed_plans info."""
        request = {
            "plan_ids": ["residential_simple_2_tier", "invalid_plan_xyz"],
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

        response = client.post(
            "/api/v1/calculate/compare",
            json=request,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have at least one successful result
        assert len(data["comparison"]) >= 1

        # Should indicate which plans failed
        if "failed_plans" not in data:
            pytest.fail(
                "R3 NOT FIXED: No failed_plans field. "
                "Partial failures should be reported."
            )

        assert isinstance(data["failed_plans"], list)


class TestRegressionR4_StartScriptSafety:
    """Regression tests for R4: start-web.sh should only kill its own PIDs."""

    def test_r4_script_uses_pid_specific_kill(self):
        """R4 Regression: Verify script uses PID-specific kill, not pkill -f."""
        script_path = ROOT / "start-web.sh"

        if not script_path.exists():
            pytest.skip("start-web.sh not found")

        content = script_path.read_text()

        # Should NOT have pattern-matching kill
        if 'pkill -f' in content or 'pkill "*' in content:
            pytest.fail(
                "R4 NOT FIXED: Script uses pkill -f which can kill other processes. "
                "Use 'kill $PID' instead."
            )

        # Should have PID variables
        assert "BACKEND_PID" in content or "backend_pid" in content
        assert "FRONTEND_PID" in content or "frontend_pid" in content


class TestRegressionR5_GitHygiene:
    """Regression tests for R5: Git artifacts should not be committed."""

    def test_r5_gitignore_excludes_frontend_artifacts(self):
        """R5 Regression: .gitignore should exclude frontend build artifacts."""
        gitignore_paths = [
            ROOT / ".gitignore",
            ROOT / "frontend" / ".gitignore",
        ]

        for gitignore_path in gitignore_paths:
            if not gitignore_path.exists():
                continue

            content = gitignore_path.read_text()

            # Should exclude these frontend artifacts
            required_patterns = ["node_modules", "dist", "*.log"]

            for pattern in required_patterns:
                if pattern not in content:
                    pytest.fail(
                        f"R5 NOT FIXED: {gitignore_path} missing '{pattern}' pattern. "
                        f"Frontend artifacts may be committed."
                    )

    def test_r5_gitignore_excludes_python_artifacts(self):
        """R5 Regression: .gitignore should exclude Python cache artifacts."""
        gitignore_path = ROOT / ".gitignore"

        if not gitignore_path.exists():
            pytest.skip("Root .gitignore not found")

        content = gitignore_path.read_text()

        # Should exclude these Python artifacts
        # Note: *.py[cod] matches *.pyc, *.pyo, *.pyd
        required_patterns = ["__pycache__", ".pytest_cache"]
        pyc_pattern_variants = ["*.pyc", "*.py[cod]"]

        # Check that at least one .pyc pattern variant is present
        pyc_found = any(p in content for p in pyc_pattern_variants)

        for pattern in required_patterns:
            if pattern not in content:
                pytest.fail(
                    f"R5 NOT FIXED: .gitignore missing '{pattern}' pattern. "
                    f"Python artifacts may be committed."
                )

        # Verify .pyc pattern is covered (either *.pyc or *.py[cod])
        if not pyc_found:
            pytest.fail(
                "R5 NOT FIXED: .gitignore missing '*.pyc' or '*.py[cod]' pattern. "
                "Python artifacts may be committed."
            )


@pytest.fixture
def sample_csv_content():
    """Sample CSV for testing."""
    return """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
"""
