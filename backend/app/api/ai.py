from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AIQueryRequest, AIQueryResponse
from app.services.ai_service import AIService
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

@router.post("/query", response_model=AIQueryResponse)
def query_ai_insights(req: AIQueryRequest, db: Session = Depends(get_db)):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question prompt cannot be empty")
    
    result = AIService.answer_query(db, req.question.strip())
    return result

@router.get("/insights")
def get_ai_insights_summary(db: Session = Depends(get_db)):
    overview = InventoryService.get_dashboard_overview(db)
    sample_q1 = "Which materials are currently at risk of stockout?"
    res1 = AIService.answer_query(db, sample_q1)

    return {
        "summary": "AI Intelligence module continuously monitors inventory levels, lead times, and sales velocity.",
        "groq_configured": AIService.is_groq_available(),
        "total_low_stock_risk": overview["low_stock_alerts_count"],
        "sample_insight": res1
    }
