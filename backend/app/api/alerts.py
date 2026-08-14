import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert
from app.schemas import AlertOut, PaginatedResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=PaginatedResponse[AlertOut])
def get_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if severity:
        query = query.filter(Alert.severity == severity.upper())

    if status:
        query = query.filter(Alert.status == status.upper())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Alert.created_at.desc()).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )

@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/unresolve", response_model=AlertOut)
def unresolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert.status = "UNRESOLVED"
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/export/csv")
def export_alerts_csv(db: Session = Depends(get_db)):
    items = db.query(Alert).order_by(Alert.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Alert ID", "Type", "Severity", "Reference ID", "Material ID", "Message", "Status", "Created At"])

    for a in items:
        writer.writerow([
            a.alert_id,
            a.alert_type,
            a.severity,
            a.reference_id,
            a.material_id,
            a.message,
            a.status,
            a.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stock_alerts.csv"}
    )
