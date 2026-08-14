from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.models import Material, Inventory, Sale, PurchaseOrder, Vendor, Alert

class InventoryService:
    @staticmethod
    def calculate_stock_status(current_stock: float, min_stock: float, max_stock: float) -> str:
        if current_stock < (0.5 * min_stock):
            return "CRITICAL"
        elif current_stock < min_stock:
            return "LOW"
        elif current_stock > max_stock:
            return "OVERSTOCK"
        return "HEALTHY"

    @staticmethod
    def calculate_coverage_days(db: Session, material_id: str, current_stock: float) -> float:
        # 30-day average daily sales
        avg_daily_sales = db.query(func.avg(Sale.quantity)).filter(
            Sale.material_id == material_id
        ).scalar() or 0.0

        if avg_daily_sales <= 0:
            return 999.0  # High coverage if no recent sales
        return round(current_stock / avg_daily_sales, 1)

    @staticmethod
    def get_dashboard_overview(db: Session) -> Dict[str, Any]:
        # 1. Total Units & Total Value
        inv_query = db.query(
            func.sum(Inventory.current_stock).label("total_units"),
            func.sum(Inventory.current_stock * Material.unit_price).label("total_value")
        ).join(Material, Inventory.material_id == Material.material_id).first()

        total_units = float(inv_query.total_units or 0.0)
        total_value = float(inv_query.total_value or 0.0)

        # 2. Low stock alert count (CRITICAL + LOW)
        low_stock_count = db.query(Inventory).filter(
            Inventory.stock_status.in_(["CRITICAL", "LOW"])
        ).count()

        # 3. Estimated replenishment cost
        low_items = db.query(Inventory, Material).join(
            Material, Inventory.material_id == Material.material_id
        ).filter(Inventory.stock_status.in_(["CRITICAL", "LOW"])).all()

        est_replenishment = 0.0
        for inv, mat in low_items:
            needed = max(0.0, mat.target_stock if hasattr(mat, 'target_stock') else mat.max_stock - inv.current_stock)
            est_replenishment += needed * mat.unit_price

        # 4. Stock status breakdown
        status_counts = db.query(
            Inventory.stock_status, func.count(Inventory.inventory_id)
        ).group_by(Inventory.stock_status).all()
        breakdown = {status: count for status, count in status_counts}

        # 5. Fast moving materials (top 5 by sales volume)
        fast_moving_mats = db.query(
            Sale.material_id,
            Material.description,
            func.sum(Sale.quantity).label("total_sales"),
            Inventory.current_stock
        ).join(Material, Sale.material_id == Material.material_id)\
         .join(Inventory, Sale.material_id == Inventory.material_id)\
         .group_by(Sale.material_id, Material.description, Inventory.current_stock)\
         .order_by(func.sum(Sale.quantity).desc()).limit(5).all()

        fast_moving = []
        for mat_id, desc, total_sales, stock in fast_moving_mats:
            coverage = InventoryService.calculate_coverage_days(db, mat_id, stock)
            fast_moving.append({
                "material_id": mat_id,
                "description": desc,
                "sales_30d": float(total_sales or 0),
                "current_stock": float(stock or 0),
                "coverage_days": coverage
            })

        return {
            "total_inventory_units": round(total_units, 2),
            "total_inventory_value": round(total_value, 2),
            "low_stock_alerts_count": low_stock_count,
            "estimated_replenishment_cost": round(est_replenishment, 2),
            "stock_status_breakdown": breakdown,
            "fast_moving_materials": fast_moving
        }
