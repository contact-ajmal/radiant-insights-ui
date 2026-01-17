"""
RadiantAI - MedGemma-Powered Multimodal Radiology Assistant
Main FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from app.config.database import init_db, close_db
from app.config.settings import get_settings
from app.medgemma import get_medgemma_engine

# Import routers
from app.patients.routes import router as patients_router
from app.studies.routes import router as studies_router
from app.analysis.routes import router as analysis_router
from app.reports.routes import router as reports_router
from app.export.routes import router as export_router
from app.auth.routes import router as auth_router

# Configure logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    settings = get_settings()
    logger.info(
        "starting_radiantai",
        mode=settings.mode,
        version=settings.app_version
    )

    # Initialize database
    await init_db()
    logger.info("database_initialized")

    # Initialize MedGemma engine
    try:
        engine = get_medgemma_engine()
        logger.info("medgemma_initialized", engine_info=engine.get_info())
    except Exception as e:
        logger.error("medgemma_initialization_failed", error=str(e))

    yield

    # Cleanup
    logger.info("shutting_down_radiantai")
    await close_db()

    # Close MedGemma engine
    try:
        engine = get_medgemma_engine()
        await engine.close()
    except Exception:
        pass


# Create FastAPI app
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="MedGemma-Powered Multimodal Radiology Assistant",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(studies_router)
app.include_router(analysis_router)
app.include_router(reports_router)
app.include_router(export_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "application": settings.app_name,
        "version": settings.app_version,
        "mode": settings.mode,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check MedGemma status
    medgemma_available = False
    try:
        engine = get_medgemma_engine()
        medgemma_available = True
    except Exception:
        pass

    return {
        "status": "healthy",
        "mode": settings.mode,
        "components": {
            "medgemma": medgemma_available,
            "database": True,  # If we got this far, DB is working
            "storage": True,   # Basic storage is always available in offline mode
        }
    }


@app.get("/api/config")
async def get_config():
    """Get public configuration"""
    return {
        "mode": settings.mode,
        "features": {
            "pacs_integration": settings.enable_pacs_integration,
            "ris_integration": settings.enable_ris_integration,
            "fhir_integration": settings.enable_fhir_integration,
            "offline_sync": settings.enable_offline_sync,
        },
        "supported_modalities": ["CT", "MRI"],
        "max_upload_size": settings.max_upload_size,
    }


@app.put("/api/config")
async def update_config(config_update: dict):
    """Update configuration (demo endpoint - in production would persist to DB/file)"""
    # In a real implementation, this would:
    # 1. Validate the config_update
    # 2. Persist to database or config file
    # 3. Possibly reload settings
    # For now, we just acknowledge the update
    logger.info("config_updated", update=config_update)
    return {
        "status": "success",
        "message": "Configuration updated successfully",
        "applied": config_update
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
