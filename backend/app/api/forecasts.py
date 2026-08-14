from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Material
from app.schemas import ForecastOut, RecommendationOut
from app.services.forecast_service import ForecastService
from app.services.recommendation_service import RecommendationService
from app.services.ai_service import AIService

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.get("/{material_id}", response_model=ForecastOut)
def get_material_forecast(
    material_id: str,
    horizon_days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    mat = db.query(Material).filter(Material.material_id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail=f"Material {material_id} not found")

    forecast = ForecastService.generate_forecast(db, material_id=material_id, horizon_days=horizon_days)
    return forecast

@router.post("/{material_id}/recommend")
def generate_recommendation_endpoint(
    material_id: str,
    db: Session = Depends(get_db)
):
    try:
        rec = RecommendationService.generate_material_recommendation(db, material_id)
        rec_dto = RecommendationOut.from_orm(rec)
        ai_explanation = AIService.explain_recommendation({
            "material_id": rec.material_id,
            "current_stock": rec.current_stock,
            "incoming_stock": rec.incoming_stock,
            "predicted_demand": rec.predicted_demand,
            "safety_stock": rec.safety_stock,
            "required_stock": rec.required_stock,
            "available_stock": rec.available_stock,
            "recommended_order_qty": rec.recommended_order_qty
        })
        return {
            "recommendation": rec_dto,
            "ai_explanation": ai_explanation
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendation: {str(e)}")
