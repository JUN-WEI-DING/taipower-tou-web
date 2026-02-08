"""Backend API routes package."""

from backend.api.calculations import router as calculations_router
from backend.api.plans import router as plans_router
from backend.api.upload import router as upload_router

__all__ = ["plans_router", "calculations_router", "upload_router"]
