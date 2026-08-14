from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.schemas import HealthResponse
from app.services.ai_service import AIService

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    groq_status = "available" if AIService.is_groq_available() else "not_configured"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status,
        sap_mode=settings.SAP_MODE,
        sap_status="available" if settings.SAP_MODE in ["mock", "real"] else "unavailable",
        groq_status=groq_status,
        version=settings.VERSION
    )
