import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Material, Inventory, Recommendation
from app.services.forecast_service import ForecastService

class RecommendationService:
    @staticmethod
    def calculate_replenishment(
        current_stock: float,
        incoming_stock: float,
        predicted_demand: float,
        safety_stock: float
    ) -> Dict[str, float]:
        available_stock = current_stock + incoming_stock
        required_stock = predicted_demand + safety_stock
        recommended_order = max(0.0, required_stock - available_stock)
        return {
            "available_stock": round(available_stock, 2),
            "required_stock": round(required_stock, 2),
            "recommended_order": round(recommended_order, 2)
        }

    @staticmethod
    def generate_material_recommendation(
        db: Session,
        material_id: str,
        predicted_demand_override: float = None
    ) -> Recommendation:
        mat = db.query(Material).filter(Material.material_id == material_id).first()
        if not mat:
            raise ValueError(f"Material {material_id} not found")

        inv = db.query(Inventory).filter(Inventory.material_id == material_id).first()
        current_stock = inv.current_stock if inv else 0.0
        incoming_stock = inv.incoming_stock if inv else 0.0
        safety_stock = mat.safety_stock

        if predicted_demand_override is not None:
            predicted_demand = predicted_demand_override
        else:
            fc_res = ForecastService.generate_forecast(db, material_id, horizon_days=30)
            predicted_demand = fc_res.get("predicted_demand", 150.0)

        calc = RecommendationService.calculate_replenishment(
            current_stock=current_stock,
            incoming_stock=incoming_stock,
            predicted_demand=predicted_demand,
            safety_stock=safety_stock
        )

        reasoning = (
            f"Current stock: {current_stock} | Incoming stock: {incoming_stock} | "
            f"Predicted demand: {predicted_demand} | Safety stock: {safety_stock} | "
            f"Required stock: {calc['required_stock']} | Available stock: {calc['available_stock']} | "
            f"Recommended order: {calc['recommended_order']}"
        )

        rec = Recommendation(
            material_id=material_id,
            current_stock=current_stock,
            incoming_stock=incoming_stock,
            predicted_demand=predicted_demand,
            safety_stock=safety_stock,
            required_stock=calc["required_stock"],
            available_stock=calc["available_stock"],
            recommended_order_qty=calc["recommended_order"],
            status="NEW",
            reasoning=reasoning,
            created_at=datetime.datetime.utcnow()
        )

        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec
