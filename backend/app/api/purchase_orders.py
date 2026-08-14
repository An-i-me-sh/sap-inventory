import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import PurchaseOrder, Material, Vendor
from app.schemas import PurchaseOrderOut, PaginatedResponse

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

@router.get("", response_model=PaginatedResponse[PurchaseOrderOut])
def get_purchase_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    search: Optional[str] = None,
    status: Optional[str] = None,
    delivery_status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PurchaseOrder).join(Material, PurchaseOrder.material_id == Material.material_id)\
                                   .join(Vendor, PurchaseOrder.vendor_id == Vendor.vendor_id)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                PurchaseOrder.po_number.ilike(s),
                PurchaseOrder.material_id.ilike(s),
                Material.description.ilike(s),
                Vendor.name.ilike(s)
            )
        )

    if status:
        query = query.filter(PurchaseOrder.status == status.upper())

    if delivery_status:
        query = query.filter(PurchaseOrder.delivery_status == delivery_status.upper())

    if vendor_id:
        query = query.filter(PurchaseOrder.vendor_id == vendor_id)

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(PurchaseOrder.order_date.desc()).offset(offset).limit(page_size).all()

    results = []
    for po in items:
        po_dto = PurchaseOrderOut.from_orm(po)
        po_dto.material_description = po.material.description if po.material else ""
        po_dto.vendor_name = po.vendor.name if po.vendor else ""
        results.append(po_dto)

    return PaginatedResponse(
        items=results,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/export/csv")
def export_purchase_orders_csv(db: Session = Depends(get_db)):
    items = db.query(PurchaseOrder).join(Material, PurchaseOrder.material_id == Material.material_id)\
                                   .join(Vendor, PurchaseOrder.vendor_id == Vendor.vendor_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "PO Number", "Material ID", "Material Description", "Vendor ID", 
        "Vendor Name", "Plant", "Order Date", "Expected Delivery", 
        "Quantity", "Unit Price", "Total Value", "Status", "Delivery Status"
    ])

    for po in items:
        writer.writerow([
            po.po_number,
            po.material_id,
            po.material.description if po.material else "",
            po.vendor_id,
            po.vendor.name if po.vendor else "",
            po.plant,
            po.order_date.strftime("%Y-%m-%d"),
            po.expected_delivery.strftime("%Y-%m-%d"),
            po.quantity,
            po.unit_price,
            po.total_value,
            po.status,
            po.delivery_status
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=purchase_orders.csv"}
    )

@router.get("/{po_number}", response_model=PurchaseOrderOut)
def get_purchase_order_detail(po_number: str, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase Order {po_number} not found")
    
    po_dto = PurchaseOrderOut.from_orm(po)
    po_dto.material_description = po.material.description if po.material else ""
    po_dto.vendor_name = po.vendor.name if po.vendor else ""
    return po_dto
