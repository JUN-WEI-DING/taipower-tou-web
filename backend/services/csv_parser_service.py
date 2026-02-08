"""CSV parsing service for usage data upload."""

import io
from datetime import datetime
from typing import Any

import pandas as pd


class CSVParserService:
    """Service for parsing CSV usage data files."""

    # Common column name variations
    TIMESTAMP_COLUMNS = [
        "timestamp",
        "datetime",
        "time",
        "date",
        "時間",
        "時戳",
        "日期時間",
    ]

    USAGE_COLUMNS = [
        "usage_kwh",
        "usage",
        "kwh",
        "consumption",
        "reading",
        "用電度數",
        "用量",
        "度數",
        "讀數",
    ]

    @classmethod
    def detect_columns(cls, df: pd.DataFrame) -> tuple[str, str]:
        """Detect timestamp and usage columns from DataFrame.

        Args:
            df: Input DataFrame

        Returns:
            Tuple of (timestamp_column, usage_column)

        Raises:
            ValueError: If columns cannot be detected
        """
        # Find timestamp column
        timestamp_col = None
        for col in df.columns:
            if str(col).strip().lower() in [c.lower() for c in cls.TIMESTAMP_COLUMNS]:
                timestamp_col = col
                break

        # Find usage column
        usage_col = None
        for col in df.columns:
            if str(col).strip().lower() in [c.lower() for c in cls.USAGE_COLUMNS]:
                usage_col = col
                break

        if timestamp_col is None:
            raise ValueError(
                f"Cannot detect timestamp column. Expected one of: {cls.TIMESTAMP_COLUMNS}"
            )
        if usage_col is None:
            raise ValueError(
                f"Cannot detect usage column. Expected one of: {cls.USAGE_COLUMNS}"
            )

        return timestamp_col, usage_col

    @classmethod
    def parse_csv(cls, csv_content: str | bytes) -> dict[str, Any]:
        """Parse CSV content and return usage data.

        Args:
            csv_content: CSV file content as string or bytes

        Returns:
            Dict with parsed data:
                - data: List of usage values
                - start: Start datetime
                - freq: Detected frequency
                - record_count: Number of records
                - date_range: Dict with start/end dates
                - statistics: Dict with total_usage, average_hourly, peak_hourly
        """
        # Parse CSV
        if isinstance(csv_content, bytes):
            csv_content = csv_content.decode("utf-8")

        df = pd.read_csv(io.StringIO(csv_content))

        # Detect columns
        timestamp_col, usage_col = cls.detect_columns(df)

        # Parse timestamps
        df[timestamp_col] = pd.to_datetime(df[timestamp_col])

        # Sort by timestamp
        df = df.sort_values(timestamp_col)

        # Convert usage column to numeric, coercing errors to NaN
        df[usage_col] = pd.to_numeric(df[usage_col], errors="coerce")

        # Drop rows with NaN usage values (non-numeric data)
        original_count = len(df)
        df = df.dropna(subset=[usage_col])
        dropped_count = original_count - len(df)

        # Extract usage values as list of floats
        usage_values = df[usage_col].tolist()

        # Detect frequency
        df_indexed = df.set_index(timestamp_col)
        freq = cls._detect_frequency(df_indexed)

        # Calculate statistics with proper type guards
        if not usage_values:
            raise ValueError("No valid numeric usage values found in CSV")

        total_usage = float(sum(usage_values))

        return {
            "data": usage_values,
            "start": df[timestamp_col].iloc[0].isoformat(),
            "freq": freq,
            "record_count": len(df),
            "date_range": {
                "start": df[timestamp_col].min().isoformat(),
                "end": df[timestamp_col].max().isoformat(),
            },
            "statistics": {
                "total_usage_kwh": round(total_usage, 2),
                "average_hourly": round(total_usage / len(df), 2) if len(df) > 0 else 0,
                "peak_hourly": round(max(usage_values), 2),
                "dropped_rows": dropped_count if dropped_count > 0 else None,
            },
        }

    @classmethod
    def _detect_frequency(cls, df: pd.DataFrame) -> str:
        """Detect the frequency of time series data.

        Args:
            df: DataFrame with DatetimeIndex

        Returns:
            Frequency string ("15min", "1h", or "1D")
        """
        if len(df) < 2:
            return "1h"  # Default to hourly

        # Calculate median time difference
        time_diffs = df.index.to_series().diff().dropna()
        median_diff = time_diffs.median()

        # Classify based on difference
        if median_diff.total_seconds() <= 900:  # 15 minutes
            return "15min"
        elif median_diff.total_seconds() <= 3600:  # 1 hour
            return "1h"
        else:
            return "1D"

    @classmethod
    def validate_csv(cls, csv_content: str | bytes) -> dict[str, Any]:
        """Validate CSV file and return preview.

        Args:
            csv_content: CSV file content

        Returns:
            Dict with validation results:
                - valid: Boolean
                - errors: List of error messages
                - warnings: List of warnings
                - preview: Preview data
        """
        errors = []
        warnings = []
        preview = None

        try:
            if isinstance(csv_content, bytes):
                csv_content = csv_content.decode("utf-8")

            df = pd.read_csv(io.StringIO(csv_content))

            if len(df) == 0:
                errors.append("CSV file is empty")
                return {"valid": False, "errors": errors, "warnings": warnings, "preview": None}

            # Detect columns
            try:
                timestamp_col, usage_col = cls.detect_columns(df)
            except ValueError as e:
                errors.append(str(e))
                return {"valid": False, "errors": errors, "warnings": warnings, "preview": None}

            # Check for null values
            if df[usage_col].isnull().any():
                null_count = df[usage_col].isnull().sum()
                warnings.append(f"{null_count} rows with null usage values")

            # Check for negative values
            if (df[usage_col] < 0).any():
                warnings.append("Some rows have negative usage values")

            # Create preview
            preview_rows = min(5, len(df))
            preview = {
                "columns": list(df.columns),
                "rows": df.head(preview_rows).to_dict("records"),
            }

        except Exception as e:
            errors.append(f"Failed to parse CSV: {str(e)}")
            return {"valid": False, "errors": errors, "warnings": warnings, "preview": None}

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "preview": preview,
        }
