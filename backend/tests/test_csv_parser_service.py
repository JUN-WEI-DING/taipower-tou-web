"""Unit tests for CSVParserService."""

import pytest

from backend.services.csv_parser_service import CSVParserService


class TestCSVParse:
    """Test CSV parsing functionality."""

    def test_parse_csv_normal_input(self):
        """Test parsing a normal CSV file with valid data."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0
2025-07-01 02:00,0.9
2025-07-01 03:00,0.8"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 4
        assert len(result["data"]) == 4
        assert result["statistics"]["total_usage_kwh"] == 3.9
        assert result["statistics"]["average_hourly"] == 0.98
        assert result["statistics"]["peak_hourly"] == 1.2
        assert result["statistics"]["dropped_rows"] is None
        assert result["start"] == "2025-07-01T00:00:00"
        assert result["freq"] == "1h"

    def test_parse_csv_empty_file(self):
        """Test parsing an empty CSV file."""
        csv_content = """timestamp,usage_kwh"""

        with pytest.raises(ValueError, match="No valid numeric usage values found"):
            CSVParserService.parse_csv(csv_content)

    def test_parse_csv_non_numeric_fields(self):
        """Test parsing CSV with non-numeric values in usage column."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,invalid
2025-07-01 02:00,0.9
2025-07-01 03:00,N/A"""

        result = CSVParserService.parse_csv(csv_content)

        # Non-numeric rows should be dropped
        assert result["record_count"] == 2
        assert result["data"] == [1.2, 0.9]
        assert result["statistics"]["total_usage_kwh"] == 2.1
        assert result["statistics"]["dropped_rows"] == 2

    def test_parse_csv_mixed_numeric_types(self):
        """Test parsing CSV with mixed numeric representations."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.0
2025-07-01 01:00,"2.5"
2025-07-01 02:00,3"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 3
        assert result["statistics"]["total_usage_kwh"] == 6.5

    def test_parse_csv_negative_values(self):
        """Test that negative values are preserved (warning is validation's job)."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,-0.5
2025-07-01 02:00,0.9"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 3
        # sum() handles negative values correctly
        assert result["statistics"]["total_usage_kwh"] == 1.6

    def test_parse_csv_zero_values(self):
        """Test parsing CSV with zero values."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,0.0
2025-07-01 01:00,0.0
2025-07-01 02:00,1.5"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 3
        assert result["statistics"]["total_usage_kwh"] == 1.5
        assert result["statistics"]["average_hourly"] == 0.5

    def test_parse_csv_decimal_values(self):
        """Test parsing CSV with decimal values."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.234
2025-07-01 01:00,2.567
2025-07-01 02:00,3.890"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 3
        assert result["statistics"]["total_usage_kwh"] == 7.69

    def test_parse_csv_frequency_detection_15min(self):
        """Test frequency detection for 15-minute data."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.0
2025-07-01 00:15,1.1
2025-07-01 00:30,1.2"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["freq"] == "15min"

    def test_parse_csv_frequency_detection_1h(self):
        """Test frequency detection for hourly data."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.0
2025-07-01 01:00,1.1
2025-07-01 02:00,1.2"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["freq"] == "1h"

    def test_parse_csv_frequency_detection_daily(self):
        """Test frequency detection for daily data."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,24.0
2025-07-02 00:00,25.0
2025-07-03 00:00,26.0"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["freq"] == "1D"

    def test_parse_csv_frequency_detection_single_record(self):
        """Test frequency detection defaults to 1h for single record."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.0"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["freq"] == "1h"

    def test_parse_csv_alternative_column_names(self):
        """Test parsing with alternative column name variations."""
        csv_content = """datetime,用電度數
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["record_count"] == 2
        assert result["statistics"]["total_usage_kwh"] == 2.2

    def test_parse_csv_bytes_input(self):
        """Test parsing CSV from bytes input."""
        csv_bytes = b"timestamp,usage_kwh\n2025-07-01 00:00,1.2\n2025-07-01 01:00,1.0"

        result = CSVParserService.parse_csv(csv_bytes)

        assert result["record_count"] == 2
        assert result["statistics"]["total_usage_kwh"] == 2.2

    def test_parse_csv_date_range(self):
        """Test that date_range is correctly calculated."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-15 23:00,1.5"""

        result = CSVParserService.parse_csv(csv_content)

        assert result["date_range"]["start"] == "2025-07-01T00:00:00"
        assert result["date_range"]["end"] == "2025-07-15T23:00:00"


class TestCSVValidate:
    """Test CSV validation functionality."""

    def test_validate_csv_valid(self):
        """Test validating a valid CSV."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,1.0"""

        result = CSVParserService.validate_csv(csv_content)

        assert result["valid"] is True
        assert result["errors"] == []
        assert result["warnings"] == []
        assert result["preview"]["columns"] == ["timestamp", "usage_kwh"]
        assert len(result["preview"]["rows"]) == 2

    def test_validate_csv_empty_file(self):
        """Test validating an empty CSV file."""
        csv_content = """timestamp,usage_kwh"""

        result = CSVParserService.validate_csv(csv_content)

        assert result["valid"] is False
        assert "CSV file is empty" in result["errors"]

    def test_validate_csv_missing_columns(self):
        """Test validating CSV with missing required columns."""
        csv_content = """foo,bar
1,2"""

        result = CSVParserService.validate_csv(csv_content)

        assert result["valid"] is False
        assert any("timestamp" in e.lower() for e in result["errors"])

    def test_validate_csv_null_values(self):
        """Test validating CSV with null values."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,"""

        result = CSVParserService.validate_csv(csv_content)

        assert result["valid"] is True  # Still valid, but with warning
        assert any("null" in w.lower() for w in result["warnings"])

    def test_validate_csv_negative_values_warning(self):
        """Test that negative values generate a warning."""
        csv_content = """timestamp,usage_kwh
2025-07-01 00:00,1.2
2025-07-01 01:00,-0.5"""

        result = CSVParserService.validate_csv(csv_content)

        assert result["valid"] is True
        assert any("negative" in w.lower() for w in result["warnings"])

    def test_validate_csv_bytes_input(self):
        """Test validating CSV from bytes input."""
        csv_bytes = b"timestamp,usage_kwh\n2025-07-01 00:00,1.2"

        result = CSVParserService.validate_csv(csv_bytes)

        assert result["valid"] is True
