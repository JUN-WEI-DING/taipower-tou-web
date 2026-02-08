"""Upload API endpoints."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.services.csv_parser_service import CSVParserService

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


@router.post("/csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload and parse a CSV file with usage data.

    Args:
        file: Uploaded CSV file

    Returns:
        Dict with parsed data and validation results

    Raises:
        HTTPException: If file parsing fails
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        content = await file.read()
        parsed = CSVParserService.parse_csv(content)
        validation = CSVParserService.validate_csv(content)

        return {
            "file_id": file.filename,
            "original_filename": file.filename,
            "parsed": parsed,
            "validation": validation,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


@router.post("/validate")
async def validate_csv(file: UploadFile = File(...)):
    """Validate a CSV file without parsing.

    Args:
        file: Uploaded CSV file

    Returns:
        Dict with validation results
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        content = await file.read()
        return CSVParserService.validate_csv(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
