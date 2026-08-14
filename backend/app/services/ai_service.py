import datetime
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Material, Inventory, Alert, PurchaseOrder, Vendor

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    def is_groq_available() -> bool:
        return bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())

    @staticmethod
    def explain_recommendation(rec_data: Dict[str, Any]) -> str:
        if AIService.is_groq_available():
            try:
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)
                prompt = (
                    f"Explain the inventory replenishment recommendation for material {rec_data.get('material_id')}:\n"
                    f"Current Stock: {rec_data.get('current_stock')}\n"
                    f"Incoming Stock: {rec_data.get('incoming_stock')}\n"
                    f"Predicted 30D Demand: {rec_data.get('predicted_demand')}\n"
                    f"Safety Stock Target: {rec_data.get('safety_stock')}\n"
                    f"Required Stock: {rec_data.get('required_stock')}\n"
                    f"Available Stock: {rec_data.get('available_stock')}\n"
                    f"Recommended Order Quantity: {rec_data.get('recommended_order_qty')}\n\n"
                    "Provide a concise 2-sentence executive summary explaining why this order quantity is recommended."
                )
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Groq API call failed: {str(e)}")

        # Fallback explanation if Groq is unavailable
        req = rec_data.get('required_stock', 0)
        avail = rec_data.get('available_stock', 0)
        rec = rec_data.get('recommended_order_qty', 0)
        return (
            f"Material {rec_data.get('material_id')} has an available stock of {avail} units against a total required "
            f"stock of {req} units (including safety stock). An order of {rec} units is recommended to maintain optimal operational coverage."
        )

    @staticmethod
    def answer_query(db: Session, question: str) -> Dict[str, Any]:
        q_lower = question.lower()
        source_data = {}

        # Controlled DB queries based on user question intent
        if "critical" in q_lower or "stockout" in q_lower or "low stock" in q_lower or "risk" in q_lower:
            critical_inv = db.query(Inventory, Material).join(
                Material, Inventory.material_id == Material.material_id
            ).filter(Inventory.stock_status.in_(["CRITICAL", "LOW"])).limit(10).all()
            
            source_data["at_risk_materials"] = [
                {
                    "material_id": inv.material_id,
                    "description": mat.description,
                    "current_stock": inv.current_stock,
                    "min_stock": mat.min_stock,
                    "status": inv.stock_status
                }
                for inv, mat in critical_inv
            ]
        elif "po" in q_lower or "purchase order" in q_lower or "delayed" in q_lower or "vendor" in q_lower:
            delayed_pos = db.query(PurchaseOrder).filter(PurchaseOrder.delivery_status == "DELAYED").limit(10).all()
            source_data["delayed_purchase_orders"] = [
                {
                    "po_number": po.po_number,
                    "material_id": po.material_id,
                    "vendor_id": po.vendor_id,
                    "expected_delivery": po.expected_delivery.strftime("%Y-%m-%d"),
                    "status": po.status
                }
                for po in delayed_pos
            ]
        else:
            total_mats = db.query(Material).count()
            alerts_count = db.query(Alert).filter(Alert.status == "UNRESOLVED").count()
            source_data["inventory_summary"] = {
                "total_materials_tracked": total_mats,
                "unresolved_alerts": alerts_count
            }

        # Generate natural language summary using Groq or fallback
        if AIService.is_groq_available():
            try:
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)
                prompt = (
                    f"User asked: '{question}'\n\n"
                    f"Verified SAP platform data:\n{source_data}\n\n"
                    "Provide a professional, clear, and direct answer based strictly on the verified data above."
                )
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=250
                )
                answer = response.choices[0].message.content.strip()
                provider = "Groq LLaMA 3.3"
            except Exception as e:
                logger.warning(f"Groq query failed: {str(e)}")
                answer = AIService._generate_rule_based_answer(question, source_data)
                provider = "Deterministic Intelligence Engine (Groq fallback)"
        else:
            answer = AIService._generate_rule_based_answer(question, source_data)
            provider = "Deterministic Intelligence Engine"

        return {
            "question": question,
            "answer": answer,
            "source_data": source_data,
            "generated_at": datetime.datetime.utcnow(),
            "provider": provider
        }

    @staticmethod
    def _generate_rule_based_answer(question: str, source_data: Dict[str, Any]) -> str:
        if "at_risk_materials" in source_data:
            items = source_data["at_risk_materials"]
            if not items:
                return "All tracked inventory items are currently in healthy stock positions."
            m_list = ", ".join([f"{item['material_id']} ({item['description']}, stock: {item['current_stock']})" for item in items[:3]])
            return f"There are {len(items)} materials at risk of stockout or low stock. Key items include: {m_list}."
        elif "delayed_purchase_orders" in source_data:
            pos = source_data["delayed_purchase_orders"]
            if not pos:
                return "There are currently no delayed purchase orders."
            p_list = ", ".join([po['po_number'] for po in pos[:3]])
            return f"Found {len(pos)} purchase orders with delivery delays. Affected PO numbers: {p_list}."
        else:
            summary = source_data.get("inventory_summary", {})
            return f"System overview: Tracking {summary.get('total_materials_tracked', 0)} materials with {summary.get('unresolved_alerts', 0)} unresolved alerts."
