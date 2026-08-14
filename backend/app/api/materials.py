from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Material, Inventory, Sale, Forecast, Recommendation, Alert
from app.schemas import MaterialOut, PaginatedResponse, SaleOut, RecommendationOut, AlertOut
from app.services.forecast_service import ForecastService
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.get("", response_model=PaginatedResponse[MaterialOut])
def get_materials_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    search: Optional[str] = None,
    plant: Optional[str] = None,
    category: Optional[str] = None,
    abc_classification: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Material)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Material.material_id.ilike(s),
                Material.description.ilike(s),
                Material.category.ilike(s)
            )
        )

    if plant:
        query = query.filter(Material.plant == plant)

    if category:
        query = query.filter(Material.category == category)

    if abc_classification:
        query = query.filter(Material.abc_classification == abc_classification.upper())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Material.material_id).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/{material_id}")
def get_material_detail(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.material_id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail=f"Material {material_id} not found")

    inv = db.query(Inventory).filter(Inventory.material_id == material_id).first()
    sales = db.query(Sale).filter(Sale.material_id == material_id).order_by(Sale.sale_date.desc()).limit(30).all()
    recent_forecast = db.query(Forecast).filter(Forecast.material_id == material_id).order_by(Forecast.forecast_date.desc()).first()
    recent_recommendation = db.query(Recommendation).filter(Recommendation.material_id == material_id).order_by(Recommendation.created_at.desc()).first()
    alerts = db.query(Alert).filter(Alert.material_id == material_id, Alert.status == "UNRESOLVED").all()

    # Formulate baseline recommendation if none present
    if not recent_recommendation:
        try:
            recent_recommendation = RecommendationService.generate_material_recommendation(db, material_id)
        except Exception:
            recent_recommendation = None

    # Generate ML forecast if none present
    if not recent_forecast:
        try:
            # We don't need the dict output, we just need to generate and save it, then fetch the DB model
            from app.services.forecast_service import ForecastService
            ForecastService.generate_forecast(db, material_id)
            recent_forecast = db.query(Forecast).filter(Forecast.material_id == material_id).order_by(Forecast.forecast_date.desc()).first()
        except Exception:
            recent_forecast = None

    return {
        "material": MaterialOut.from_orm(mat),
        "inventory": inv,
        "sales_history": [SaleOut.from_orm(s) for s in sales],
        "latest_forecast": recent_forecast,
        "latest_recommendation": recent_recommendation,
        "alerts": [AlertOut.from_orm(a) for a in alerts]
    }
