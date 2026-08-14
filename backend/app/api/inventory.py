import csv
import io
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from app.database import get_db
from app.models import Inventory, Material
from app.schemas import InventoryOut, PaginatedResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=PaginatedResponse[InventoryOut])
def get_inventory_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    search: Optional[str] = None,
    plant: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "material_id",
    sort_dir: Optional[str] = "asc",
    db: Session = Depends(get_db)
):
    query = db.query(Inventory).join(Material, Inventory.material_id == Material.material_id)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Inventory.material_id.ilike(s),
                Material.description.ilike(s),
                Inventory.plant.ilike(s),
                Inventory.storage_location.ilike(s)
            )
        )

    if plant:
        query = query.filter(Inventory.plant == plant)

    if category:
        query = query.filter(Material.category == category)

    if status:
        query = query.filter(Inventory.stock_status == status.upper())

    # Sorting
    if sort_by == "current_stock":
        order_col = Inventory.current_stock
    elif sort_by == "stock_status":
        order_col = Inventory.stock_status
    elif sort_by == "plant":
        order_col = Inventory.plant
    else:
        order_col = Inventory.material_id

    if sort_dir.lower() == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    # Enriched inventory items with stock coverage and total value
    results = []
    for inv in items:
        inv_dict = InventoryOut.from_orm(inv)
        coverage = InventoryService.calculate_coverage_days(db, inv.material_id, inv.current_stock)
        inv_dict.stock_coverage_days = coverage
        inv_dict.inventory_value = round(inv.current_stock * (inv.material.unit_price if inv.material else 0.0), 2)
        results.append(inv_dict)

    return PaginatedResponse(
        items=results,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/export/csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    items = db.query(Inventory).join(Material, Inventory.material_id == Material.material_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Material ID", "Description", "Plant", "Storage Location", 
        "Current Stock", "Reserved Stock", "Incoming Stock", 
        "Min Stock", "Max Stock", "Unit Price", "Stock Status", "Inventory Value"
    ])

    for inv in items:
        unit_price = inv.material.unit_price if inv.material else 0.0
        val = inv.current_stock * unit_price
        writer.writerow([
            inv.material_id,
            inv.material.description if inv.material else "",
            inv.plant,
            inv.storage_location,
            inv.current_stock,
            inv.reserved_stock,
            inv.incoming_stock,
            inv.material.min_stock if inv.material else 0,
            inv.material.max_stock if inv.material else 0,
            unit_price,
            inv.stock_status,
            val
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory_ledger.csv"}
    )

@router.get("/{material_id}", response_model=InventoryOut)
def get_inventory_item(material_id: str, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.material_id == material_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Inventory for material {material_id} not found")
    
    inv_dict = InventoryOut.from_orm(inv)
    inv_dict.stock_coverage_days = InventoryService.calculate_coverage_days(db, inv.material_id, inv.current_stock)
    inv_dict.inventory_value = round(inv.current_stock * (inv.material.unit_price if inv.material else 0.0), 2)
    return inv_dict
