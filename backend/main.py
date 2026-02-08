"""FastAPI backend for taipower-tou web UI."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import calculations_router, plans_router, upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    print("Starting taipower-tou API...")
    yield
    # Shutdown
    print("Shutting down taipower-tou API...")


# Create FastAPI app
app = FastAPI(
    title="taipower-tou API",
    description="Taiwan time-of-use electricity tariff calculator API",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(plans_router)
app.include_router(calculations_router)
app.include_router(upload_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "taipower-tou API",
        "version": "0.1.0",
        "description": "Taiwan time-of-use electricity tariff calculator",
        "docs": "/docs",
        "endpoints": {
            "plans": "/api/v1/plans",
            "calculations": "/api/v1/calculate",
            "upload": "/api/v1/upload",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
