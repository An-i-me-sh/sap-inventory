import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Index, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="viewer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Material(Base):
    __tablename__ = "materials"

    material_id = Column(String(50), primary_key=True, index=True)
    description = Column(String(255), nullable=False, index=True)
    plant = Column(String(10), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    unit = Column(String(10), default="EA")
    unit_price = Column(Float, default=0.0)
    abc_classification = Column(String(1), default="B")
    lead_time_days = Column(Integer, default=14)
    min_stock = Column(Float, default=100.0)
    max_stock = Column(Float, default=1000.0)
    safety_stock = Column(Float, default=50.0)
    reorder_point = Column(Float, default=150.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    inventory_items = relationship("Inventory", back_populates="material", cascade="all, delete-orphan")
    sales_records = relationship("Sale", back_populates="material", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="material", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="material", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="material", cascade="all, delete-orphan")

class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("materials.material_id"), nullable=False, index=True)
    plant = Column(String(10), nullable=False, index=True)
    storage_location = Column(String(20), default="SL01")
    current_stock = Column(Float, default=0.0)
    reserved_stock = Column(Float, default=0.0)
    incoming_stock = Column(Float, default=0.0)
    stock_status = Column(String(20), default="HEALTHY", index=True)  # CRITICAL, LOW, HEALTHY, OVERSTOCK
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    material = relationship("Material", back_populates="inventory_items")

    __table_args__ = (
        Index("idx_inv_mat_plant", "material_id", "plant"),
    )

class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("materials.material_id"), nullable=False, index=True)
    plant = Column(String(10), nullable=False, index=True)
    sale_date = Column(DateTime, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    customer_id = Column(String(50), default="CUST-1000")

    material = relationship("Material", back_populates="sales_records")

    __table_args__ = (
        Index("idx_sales_mat_date", "material_id", "sale_date"),
    )

class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    contact_email = Column(String(100))
    country = Column(String(50), default="US")
    rating = Column(Float, default=4.5)
    on_time_delivery_pct = Column(Float, default=95.0)
    avg_delay_days = Column(Float, default=1.2)
    total_purchase_val = Column(Float, default=0.0)
    risk_score = Column(Float, default=15.0)  # 0 to 100

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    po_number = Column(String(50), primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("materials.material_id"), nullable=False, index=True)
    vendor_id = Column(String(50), ForeignKey("vendors.vendor_id"), nullable=False, index=True)
    plant = Column(String(10), nullable=False, index=True)
    order_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    expected_delivery = Column(DateTime, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    status = Column(String(20), default="OPEN", index=True)  # OPEN, IN_TRANSIT, DELIVERED, CANCELLED
    delivery_status = Column(String(20), default="ON_TIME")  # ON_TIME, DELAYED, CRITICAL_DELAY

    material = relationship("Material", back_populates="purchase_orders")
    vendor = relationship("Vendor", back_populates="purchase_orders")

class Forecast(Base):
    __tablename__ = "forecasts"

    forecast_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("materials.material_id"), nullable=False, index=True)
    forecast_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    horizon_days = Column(Integer, default=30)
    predicted_demand = Column(Float, nullable=False)
    confidence_lower = Column(Float)
    confidence_upper = Column(Float)
    model_version = Column(String(50), default="RandomForest-v1.0")
    daily_predictions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    material = relationship("Material", back_populates="forecasts")

class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("materials.material_id"), nullable=False, index=True)
    current_stock = Column(Float, nullable=False)
    incoming_stock = Column(Float, default=0.0)
    predicted_demand = Column(Float, nullable=False)
    safety_stock = Column(Float, nullable=False)
    required_stock = Column(Float, nullable=False)
    available_stock = Column(Float, nullable=False)
    recommended_order_qty = Column(Float, nullable=False)
    status = Column(String(20), default="NEW")  # NEW, APPROVED, PO_CREATED, REJECTED
    reasoning = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    material = relationship("Material", back_populates="recommendations")

class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False, index=True)  # CRITICAL_STOCK, LOW_STOCK, PROJECTED_STOCKOUT, DEMAND_ANOMALY, PO_DELAY, DATA_QUALITY
    severity = Column(String(20), nullable=False, index=True)  # HIGH, MEDIUM, LOW
    reference_id = Column(String(100))
    material_id = Column(String(50), index=True)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="UNRESOLVED", index=True)  # UNRESOLVED, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class SyncJob(Base):
    __tablename__ = "sync_jobs"

    job_id = Column(String(50), primary_key=True, index=True)
    source = Column(String(50), default="SAP_ODATA")
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime)
    records_fetched = Column(Integer, default=0)
    records_processed = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    status = Column(String(20), default="RUNNING")  # RUNNING, COMPLETED, PARTIAL, FAILED
    error_summary = Column(Text)

class IntegrationLog(Base):
    __tablename__ = "integration_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    service = Column(String(50), default="SAP_INTEGRATION")
    http_method = Column(String(10), default="GET")
    endpoint = Column(String(255), nullable=False)
    status_code = Column(Integer, nullable=False)
    latency_ms = Column(Float, default=0.0)
    request_id = Column(String(50))
    success = Column(Boolean, default=True)
    error_message = Column(Text)
