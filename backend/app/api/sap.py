from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import SyncJob, IntegrationLog
from app.schemas import SyncJobOut, IntegrationLogOut, PaginatedResponse
from app.services.sap_service import SyncService

router = APIRouter(tags=["SAP Integration"])

@router.get("/sap/status")
def get_sap_status(db: Session = Depends(get_db)):
    last_job = db.query(SyncJob).order_by(SyncJob.started_at.desc()).first()
    recent_logs = db.query(IntegrationLog).order_by(IntegrationLog.timestamp.desc()).limit(10).all()

    avg_latency = 0.0
    if recent_logs:
        avg_latency = sum(l.latency_ms for l in recent_logs) / len(recent_logs)

    return {
        "sap_mode": settings.SAP_MODE,
        "sap_status": "Mock SAP Environment" if settings.SAP_MODE == "mock" else "SAP Connected",
        "sap_base_url": settings.SAP_BASE_URL if settings.SAP_MODE == "real" else "Local Mock Engine",
        "sap_client": settings.SAP_CLIENT,
        "api_path": settings.SAP_API_PATH,
        "last_sync": SyncJobOut.from_orm(last_job) if last_job else None,
        "average_latency_ms": round(avg_latency, 2),
        "integration_logs_count": db.query(IntegrationLog).count()
    }

@router.post("/sync", response_model=SyncJobOut)
def trigger_sync(db: Session = Depends(get_db)):
    try:
        job = SyncService.sync_all(db)
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync execution failed: {str(e)}")

@router.get("/sync/jobs", response_model=PaginatedResponse[SyncJobOut])
def get_sync_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(SyncJob)
    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(SyncJob.started_at.desc()).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/integration-logs", response_model=PaginatedResponse[IntegrationLogOut])
def get_integration_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    service: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IntegrationLog)

    if service:
        query = query.filter(IntegrationLog.service == service)

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(IntegrationLog.timestamp.desc()).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )
