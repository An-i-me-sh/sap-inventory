import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.api import (
    health,
    dashboard,
    inventory,
    materials,
    purchase_orders,
    vendors,
    forecasts,
    analytics,
    alerts,
    sap,
    ai,
    data_quality,
    sales
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sap_inventory_platform")

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SAP S/4HANA Inventory Integration & Demand Intelligence Platform",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS setup
origins = ["*"]
if isinstance(settings.CORS_ORIGINS, list):
    origins = settings.CORS_ORIGINS
elif isinstance(settings.CORS_ORIGINS, str) and settings.CORS_ORIGINS != "*":
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again."}
    )

# Register API Routers under /api prefix
api_prefix = settings.API_V1_STR
app.include_router(health.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(materials.router, prefix=api_prefix)
app.include_router(purchase_orders.router, prefix=api_prefix)
app.include_router(vendors.router, prefix=api_prefix)
app.include_router(forecasts.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(alerts.router, prefix=api_prefix)
app.include_router(sap.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(data_quality.router, prefix=api_prefix)
app.include_router(sales.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
