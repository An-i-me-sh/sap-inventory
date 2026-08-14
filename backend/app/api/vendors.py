import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Vendor, PurchaseOrder
from app.schemas import VendorOut, PaginatedResponse, PurchaseOrderOut

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("", response_model=PaginatedResponse[VendorOut])
def get_vendors_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    search: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vendor)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Vendor.vendor_id.ilike(s),
                Vendor.name.ilike(s),
                Vendor.contact_email.ilike(s)
            )
        )

    if country:
        query = query.filter(Vendor.country == country.upper())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Vendor.vendor_id).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/export/csv")
def export_vendors_csv(db: Session = Depends(get_db)):
    items = db.query(Vendor).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Vendor ID", "Name", "Contact Email", "Country", 
        "Rating", "On-Time Delivery %", "Avg Delay (Days)", "Total Purchase Value", "Risk Score"
    ])

    for v in items:
        writer.writerow([
            v.vendor_id,
            v.name,
            v.contact_email,
            v.country,
            v.rating,
            v.on_time_delivery_pct,
            v.avg_delay_days,
            v.total_purchase_val,
            v.risk_score
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vendors.csv"}
    )

@router.get("/{vendor_id}")
def get_vendor_detail(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail=f"Vendor {vendor_id} not found")

    pos = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).order_by(PurchaseOrder.order_date.desc()).limit(20).all()

    return {
        "vendor": VendorOut.from_orm(vendor),
        "purchase_history": [PurchaseOrderOut.from_orm(po) for po in pos]
    }
