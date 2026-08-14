import time
import datetime
import uuid
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Material, Inventory, Sale, PurchaseOrder, Vendor, SyncJob, IntegrationLog, Alert

logger = logging.getLogger(__name__)

class SAPProvider(ABC):
    @abstractmethod
    def get_materials(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_inventory(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_sales(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_purchase_orders(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_vendors(self) -> List[Dict[str, Any]]:
        pass

class MockSAPProvider(SAPProvider):
    def get_materials(self) -> List[Dict[str, Any]]:
        # Generates realistic mock SAP material master data
        categories = ["Engine Parts", "Electrical", "Hydraulics", "Fasteners", "Lubricants", "Transmission"]
        plants = ["PL01", "PL02", "PL03"]
        items = []
        for i in range(1, 101):
            mat_id = f"MAT-{1000 + i}"
            cat = categories[i % len(categories)]
            plant = plants[i % len(plants)]
            items.append({
                "material_id": mat_id,
                "description": f"{cat[:-1] if cat.endswith('s') else cat} Component Spec-{i}",
                "plant": plant,
                "category": cat,
                "unit": "EA" if cat != "Lubricants" else "L",
                "unit_price": round(15.0 + (i * 12.5) % 850, 2),
                "abc_classification": "A" if i % 5 == 0 else ("B" if i % 2 == 0 else "C"),
                "lead_time_days": 7 + (i % 21),
                "min_stock": 100.0 + (i * 10 % 300),
                "max_stock": 1000.0 + (i * 50 % 3000),
                "safety_stock": 50.0 + (i * 5 % 150),
                "reorder_point": 150.0 + (i * 15 % 450)
            })
        return items

    def get_inventory(self) -> List[Dict[str, Any]]:
        items = []
        for i in range(1, 101):
            mat_id = f"MAT-{1000 + i}"
            plant = ["PL01", "PL02", "PL03"][i % 3]
            # Vary current stock to demonstrate CRITICAL, LOW, HEALTHY, OVERSTOCK
            if i % 15 == 0:
                stock = 20.0  # Critical (< 50% min stock)
            elif i % 7 == 0:
                stock = 80.0  # Low (< min stock)
            elif i % 11 == 0:
                stock = 4500.0  # Overstock (> max stock)
            else:
                stock = 350.0 + (i * 25 % 800)  # Healthy
            
            items.append({
                "material_id": mat_id,
                "plant": plant,
                "storage_location": "SL01",
                "current_stock": stock,
                "reserved_stock": round(stock * 0.1, 1),
                "incoming_stock": 50.0 if stock < 150 else 0.0
            })
        return items

    def get_sales(self) -> List[Dict[str, Any]]:
        items = []
        now = datetime.datetime.utcnow()
        for i in range(1, 501):
            mat_id = f"MAT-{1000 + (i % 100) + 1}"
            days_ago = i % 90
            sale_date = now - datetime.timedelta(days=days_ago)
            qty = float(5 + (i * 3 % 45))
            price = round(15.0 + ((i % 100) * 12.5) % 850, 2)
            items.append({
                "material_id": mat_id,
                "plant": ["PL01", "PL02", "PL03"][i % 3],
                "sale_date": sale_date,
                "quantity": qty,
                "unit_price": price,
                "total_amount": round(qty * price, 2),
                "customer_id": f"CUST-{2000 + (i % 20)}"
            })
        return items

    def get_purchase_orders(self) -> List[Dict[str, Any]]:
        items = []
        now = datetime.datetime.utcnow()
        for i in range(1, 51):
            po_num = f"PO-45000{100 + i}"
            mat_id = f"MAT-{1000 + (i % 100) + 1}"
            vendor_id = f"VEND-{1000 + (i % 15) + 1}"
            order_date = now - datetime.timedelta(days=i % 30)
            expected = order_date + datetime.timedelta(days=14)
            status = "OPEN" if i % 3 != 0 else "DELIVERED"
            deliv_status = "DELAYED" if (i % 5 == 0 and status == "OPEN") else "ON_TIME"
            items.append({
                "po_number": po_num,
                "material_id": mat_id,
                "vendor_id": vendor_id,
                "plant": ["PL01", "PL02", "PL03"][i % 3],
                "order_date": order_date,
                "expected_delivery": expected,
                "quantity": float(100 + (i * 20)),
                "unit_price": 50.0,
                "total_value": float((100 + (i * 20)) * 50),
                "status": status,
                "delivery_status": deliv_status
            })
        return items

    def get_vendors(self) -> List[Dict[str, Any]]:
        items = []
        for i in range(1, 16):
            items.append({
                "vendor_id": f"VEND-{1000 + i}",
                "name": f"SAP Global Vendor {i} Inc.",
                "contact_email": f"supply{i}@sapvendor.com",
                "country": ["US", "DE", "IN", "JP", "GB"][i % 5],
                "rating": round(3.8 + (i % 12) * 0.1, 1),
                "on_time_delivery_pct": round(82.0 + (i * 1.2) % 17.5, 1),
                "avg_delay_days": round(0.5 + (i % 5) * 0.8, 1),
                "total_purchase_val": round(50000.0 + i * 25000.0, 2),
                "risk_score": round(10.0 + (15 - i) * 5.0, 1)
            })
        return items

class RealSAPProvider(SAPProvider):
    def __init__(self):
        self.base_url = settings.SAP_BASE_URL
        self.client = settings.SAP_CLIENT
        self.username = settings.SAP_USERNAME
        self.password = settings.SAP_PASSWORD
        self.api_path = settings.SAP_API_PATH

    def _fetch_odata(self, entity_set: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}{self.api_path}/{entity_set}?sap-client={self.client}&$format=json"
        try:
            with httpx.Client(timeout=settings.SAP_TIMEOUT, verify=False) as http_client:
                response = http_client.get(url, auth=(self.username, self.password))
                response.raise_for_status()
                data = response.json()
                return data.get("d", {}).get("results", [])
        except Exception as e:
            logger.error(f"Failed to fetch {entity_set} from real SAP: {str(e)}")
            raise

    def get_materials(self) -> List[Dict[str, Any]]:
        return self._fetch_odata("MaterialSet")

    def get_inventory(self) -> List[Dict[str, Any]]:
        return self._fetch_odata("InventorySet")

    def get_sales(self) -> List[Dict[str, Any]]:
        return self._fetch_odata("SalesSet")

    def get_purchase_orders(self) -> List[Dict[str, Any]]:
        return self._fetch_odata("PurchaseOrderSet")

    def get_vendors(self) -> List[Dict[str, Any]]:
        return self._fetch_odata("VendorSet")

def get_sap_provider() -> SAPProvider:
    if settings.SAP_MODE == "real":
        return RealSAPProvider()
    return MockSAPProvider()

class SyncService:
    @staticmethod
    def sync_all(db: Session) -> SyncJob:
        job_id = f"SYNC-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.datetime.utcnow()
        t0 = time.time()

        job = SyncJob(
            job_id=job_id,
            source=f"SAP_{settings.SAP_MODE.upper()}",
            started_at=start_time,
            status="RUNNING"
        )
        db.add(job)
        db.commit()

        provider = get_sap_provider()
        fetched = 0
        processed = 0
        failed = 0
        error_msg = None

        try:
            # 1. Sync Vendors
            v_start = time.time()
            vendors_data = provider.get_vendors()
            fetched += len(vendors_data)
            for v_item in vendors_data:
                try:
                    existing = db.query(Vendor).filter(Vendor.vendor_id == v_item["vendor_id"]).first()
                    if existing:
                        for key, val in v_item.items():
                            setattr(existing, key, val)
                    else:
                        db.add(Vendor(**v_item))
                    processed += 1
                except Exception:
                    failed += 1
            
            # Log Integration
            db.add(IntegrationLog(
                timestamp=datetime.datetime.utcnow(),
                service="SAP_VENDOR_SRV",
                http_method="GET",
                endpoint="/VendorSet",
                status_code=200,
                latency_ms=round((time.time() - v_start) * 1000, 2),
                request_id=f"REQ-{uuid.uuid4().hex[:6]}",
                success=True
            ))

            # 2. Sync Materials
            m_start = time.time()
            mats_data = provider.get_materials()
            fetched += len(mats_data)
            for m_item in mats_data:
                try:
                    existing = db.query(Material).filter(Material.material_id == m_item["material_id"]).first()
                    if existing:
                        for key, val in m_item.items():
                            setattr(existing, key, val)
                    else:
                        db.add(Material(**m_item))
                    processed += 1
                except Exception:
                    failed += 1

            db.add(IntegrationLog(
                timestamp=datetime.datetime.utcnow(),
                service="SAP_MATERIAL_SRV",
                http_method="GET",
                endpoint="/MaterialSet",
                status_code=200,
                latency_ms=round((time.time() - m_start) * 1000, 2),
                request_id=f"REQ-{uuid.uuid4().hex[:6]}",
                success=True
            ))

            # 3. Sync Inventory & Evaluate Stock Status
            inv_start = time.time()
            inv_data = provider.get_inventory()
            fetched += len(inv_data)
            for inv_item in inv_data:
                try:
                    mat = db.query(Material).filter(Material.material_id == inv_item["material_id"]).first()
                    min_stock = mat.min_stock if mat else 100.0
                    max_stock = mat.max_stock if mat else 1000.0
                    stock = inv_item["current_stock"]

                    # Compute stock status rules (Section 11)
                    if stock < (0.5 * min_stock):
                        status = "CRITICAL"
                    elif stock < min_stock:
                        status = "LOW"
                    elif stock > max_stock:
                        status = "OVERSTOCK"
                    else:
                        status = "HEALTHY"
                    
                    inv_item["stock_status"] = status

                    existing = db.query(Inventory).filter(
                        Inventory.material_id == inv_item["material_id"],
                        Inventory.plant == inv_item["plant"]
                    ).first()
                    if existing:
                        for key, val in inv_item.items():
                            setattr(existing, key, val)
                    else:
                        db.add(Inventory(**inv_item))
                    processed += 1

                    # Trigger stock alerts if critical or low
                    if status in ["CRITICAL", "LOW"]:
                        db.add(Alert(
                            alert_type=f"{status}_STOCK",
                            severity="HIGH" if status == "CRITICAL" else "MEDIUM",
                            reference_id=inv_item["material_id"],
                            material_id=inv_item["material_id"],
                            message=f"Material {inv_item['material_id']} current stock ({stock}) is in {status} state (Min: {min_stock}).",
                            status="UNRESOLVED"
                        ))
                except Exception:
                    failed += 1

            db.add(IntegrationLog(
                timestamp=datetime.datetime.utcnow(),
                service="SAP_INVENTORY_SRV",
                http_method="GET",
                endpoint="/InventorySet",
                status_code=200,
                latency_ms=round((time.time() - inv_start) * 1000, 2),
                request_id=f"REQ-{uuid.uuid4().hex[:6]}",
                success=True
            ))

            db.commit()

            job.status = "COMPLETED"
        except Exception as e:
            db.rollback()
            logger.error(f"Sync error: {str(e)}")
            job.status = "FAILED"
            error_msg = str(e)
            db.add(IntegrationLog(
                timestamp=datetime.datetime.utcnow(),
                service="SAP_SYNC_SRV",
                http_method="GET",
                endpoint="/SyncAll",
                status_code=500,
                latency_ms=round((time.time() - t0) * 1000, 2),
                request_id=f"REQ-{uuid.uuid4().hex[:6]}",
                success=False,
                error_message=str(e)
            ))
        
        job.completed_at = datetime.datetime.utcnow()
        job.records_fetched = fetched
        job.records_processed = processed
        job.records_failed = failed
        job.duration_seconds = round(time.time() - t0, 3)
        job.error_summary = error_msg

        db.commit()
        db.refresh(job)
        return job
