from typing import Dict, Any
import datetime
from sqlalchemy.orm import Session
from app.models import Sale, Forecast, Material
from app.ml.forecasting import DemandForecaster

class ForecastService:
    @staticmethod
    def generate_forecast(db: Session, material_id: str, horizon_days: int = 30) -> Dict[str, Any]:
        sales = db.query(Sale).filter(Sale.material_id == material_id).all()
        sales_data = [
            {"sale_date": s.sale_date, "quantity": s.quantity}
            for s in sales
        ]

        result = DemandForecaster.train_and_predict(sales_data, horizon_days=horizon_days)

        if result["status"] == "success":
            # Save forecast record
            forecast_rec = Forecast(
                material_id=material_id,
                forecast_date=datetime.datetime.utcnow(),
                horizon_days=horizon_days,
                predicted_demand=result["predicted_demand"],
                confidence_lower=result["confidence_lower"],
                confidence_upper=result["confidence_upper"],
                model_version=result["model_version"],
                daily_predictions=result.get("daily_predictions", [])
            )
            db.add(forecast_rec)
            db.commit()
            db.refresh(forecast_rec)
            result["forecast_id"] = forecast_rec.forecast_id
            result["material_id"] = material_id
            result["forecast_date"] = forecast_rec.forecast_date
            result["horizon_days"] = horizon_days
        else:
            result["material_id"] = material_id
            result["forecast_date"] = datetime.datetime.utcnow()
            result["horizon_days"] = horizon_days

        return result
