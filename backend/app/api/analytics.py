from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Material, Inventory, Sale, Vendor, PurchaseOrder
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics_metrics(db: Session = Depends(get_db)):
    # Valuation by Category
    cat_val = db.query(
        Material.category,
        func.sum(Inventory.current_stock * Material.unit_price).label("valuation"),
        func.count(Material.material_id).label("item_count")
    ).join(Inventory, Material.material_id == Inventory.material_id)\
     .group_by(Material.category).all()

    category_valuation = [
        {"category": cat, "valuation": round(float(val or 0), 2), "count": count}
        for cat, val, count in cat_val
    ]

    # Stock Status Breakdown by Plant
    plant_val = db.query(
        Inventory.plant,
        func.sum(Inventory.current_stock).label("units"),
        func.sum(Inventory.current_stock * Material.unit_price).label("valuation")
    ).join(Material, Inventory.material_id == Material.material_id)\
     .group_by(Inventory.plant).all()

    plant_distribution = [
        {"plant": plant, "units": float(units or 0), "valuation": round(float(val or 0), 2)}
        for plant, units, val in plant_val
    ]

    # ABC Classification
    abc_val = db.query(
        Material.abc_classification,
        func.count(Material.material_id).label("count"),
        func.sum(Inventory.current_stock * Material.unit_price).label("valuation")
    ).join(Inventory, Material.material_id == Inventory.material_id)\
     .group_by(Material.abc_classification).all()

    abc_breakdown = [
        {"class": abc, "count": count, "valuation": round(float(val or 0), 2)}
        for abc, count, val in abc_val
    ]

    # Inventory Turnover Ratio Estimate
    total_sales_val = db.query(func.sum(Sale.total_amount)).scalar() or 1.0
    avg_inv_val = db.query(func.sum(Inventory.current_stock * Material.unit_price)).scalar() or 1.0
    turnover_ratio = round(float(total_sales_val) / float(avg_inv_val), 2)

    return {
        "category_valuation": category_valuation,
        "plant_distribution": plant_distribution,
        "abc_breakdown": abc_breakdown,
        "turnover_ratio": turnover_ratio,
        "average_holding_days": round(365.0 / max(0.1, turnover_ratio), 1)
    }
