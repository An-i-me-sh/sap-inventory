from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sale
from app.schemas import SaleOut, PaginatedResponse

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.get("", response_model=PaginatedResponse[SaleOut])
def get_sales_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    material_id: Optional[str] = None,
    plant: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Sale)

    if material_id:
        query = query.filter(Sale.material_id == material_id)

    if plant:
        query = query.filter(Sale.plant == plant)

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Sale.sale_date.desc()).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )
