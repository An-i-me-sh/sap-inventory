from datetime import datetime
from typing import List, Optional, Generic, TypeVar, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    page: int
    page_size: int
    total: int

class HealthResponse(BaseModel):
    status: str
    database: str
    sap_mode: str
    sap_status: str
    groq_status: str
    version: str

# Material Schemas
class MaterialBase(BaseModel):
    material_id: str
    description: str
    plant: str
    category: str
    unit: str = "EA"
    unit_price: float = 0.0
    abc_classification: str = "B"
    lead_time_days: int = 14
    min_stock: float = 100.0
    max_stock: float = 1000.0
    safety_stock: float = 50.0
    reorder_point: float = 150.0

class MaterialCreate(MaterialBase):
    pass

class MaterialOut(MaterialBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryBase(BaseModel):
    material_id: str
    plant: str
    storage_location: str = "SL01"
    current_stock: float
    reserved_stock: float = 0.0
    incoming_stock: float = 0.0
    stock_status: str = "HEALTHY"

class InventoryOut(InventoryBase):
    inventory_id: int
    last_updated: datetime
    material: Optional[MaterialOut] = None
    stock_coverage_days: Optional[float] = None
    inventory_value: Optional[float] = None

    class Config:
        from_attributes = True

# Sale Schemas
class SaleOut(BaseModel):
    sale_id: int
    material_id: str
    plant: str
    sale_date: datetime
    quantity: float
    unit_price: float
    total_amount: float
    customer_id: str

    class Config:
        from_attributes = True

# Vendor Schemas
class VendorOut(BaseModel):
    vendor_id: str
    name: str
    contact_email: Optional[str] = None
    country: str
    rating: float
    on_time_delivery_pct: float
    avg_delay_days: float
    total_purchase_val: float
    risk_score: float

    class Config:
        from_attributes = True

# Purchase Order Schemas
class PurchaseOrderOut(BaseModel):
    po_number: str
    material_id: str
    vendor_id: str
    plant: str
    order_date: datetime
    expected_delivery: datetime
    quantity: float
    unit_price: float
    total_value: float
    status: str
    delivery_status: str
    material_description: Optional[str] = None
    vendor_name: Optional[str] = None

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastOut(BaseModel):
    forecast_id: Optional[int] = None
    material_id: str
    forecast_date: datetime
    horizon_days: int
    predicted_demand: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    model_version: str = "RandomForest-v1.0"
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    status_message: Optional[str] = None
    daily_predictions: Optional[list] = None

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationOut(BaseModel):
    recommendation_id: Optional[int] = None
    material_id: str
    current_stock: float
    incoming_stock: float
    predicted_demand: float
    safety_stock: float
    required_stock: float
    available_stock: float
    recommended_order_qty: float
    status: str = "NEW"
    reasoning: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationCreateReq(BaseModel):
    material_id: str
    predicted_demand: Optional[float] = None

# Alert Schemas
class AlertOut(BaseModel):
    alert_id: int
    alert_type: str
    severity: str
    reference_id: Optional[str] = None
    material_id: Optional[str] = None
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# SAP & Sync Schemas
class SyncJobOut(BaseModel):
    job_id: str
    source: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    records_fetched: int
    records_processed: int
    records_failed: int
    duration_seconds: float
    status: str
    error_summary: Optional[str] = None

    class Config:
        from_attributes = True

class IntegrationLogOut(BaseModel):
    log_id: int
    timestamp: datetime
    service: str
    http_method: str
    endpoint: str
    status_code: int
    latency_ms: float
    request_id: Optional[str] = None
    success: bool
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

# AI Query Schemas
class AIQueryRequest(BaseModel):
    question: str

class AIQueryResponse(BaseModel):
    question: str
    answer: str
    source_data: Any
    generated_at: datetime
    provider: str

# Data Quality Schemas
class DataQualityCheck(BaseModel):
    rule_name: str
    category: str
    passed: bool
    failed_count: int
    description: str

class DataQualityResponse(BaseModel):
    overall_score: float
    total_records_checked: int
    checks: List[DataQualityCheck]
    last_checked: datetime

# Dashboard Overview Schema
class DashboardOverview(BaseModel):
    total_inventory_units: float
    total_inventory_value: float
    low_stock_alerts_count: int
    estimated_replenishment_cost: float
    stock_status_breakdown: dict
    sap_status: str
    sap_mode: str
    last_sync_time: Optional[str] = None
    fast_moving_materials: List[Any] = []
    inventory_health_trend: List[Any] = []
    demand_forecast_trend: List[Any] = []
