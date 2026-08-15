from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.schemas import HealthResponse
from app.services.ai_service import AIService
import os, importlib.util, logging

logger = logging.getLogger("sap_inventory_platform")
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

@router.post("/admin/seed")
def trigger_seed():
    """Manually trigger database seeding. Safe to call multiple times — skips if already seeded."""
    try:
        candidates = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "seed.py"),
            os.path.join(os.getcwd(), "seed.py"),
            os.path.join(os.getcwd(), "backend", "seed.py"),
        ]
        seed_path = next((p for p in candidates if os.path.exists(p)), None)
        if not seed_path:
            return {"status": "error", "message": f"seed.py not found. Tried: {candidates}"}

        spec = importlib.util.spec_from_file_location("seed", seed_path)
        seed_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(seed_module)
        seed_module.seed_database()
        return {"status": "success", "message": "Seed completed. Check logs for details."}
    except Exception as e:
        logger.error(f"Manual seed failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
