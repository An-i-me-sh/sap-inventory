import sys
import os
import random
import datetime
import numpy as np

# Ensure backend app module can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import Material, Inventory, Sale, Vendor, PurchaseOrder, Alert, SyncJob, IntegrationLog
from app.services.inventory_service import InventoryService

def seed_database():
    print("Starting deterministic database seeding...")
    
    # 1. Set fixed random seed
    random.seed(42)
    np.random.seed(42)

    # 2. Reset / recreate schema
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if database already has seed data
        existing_mats = db.query(Material).count()
        if existing_mats >= 500:
            print(f"Database already contains {existing_mats} materials. Skipping seed.")
            return

        print("Clearing existing data...")
        db.query(Alert).delete()
        db.query(PurchaseOrder).delete()
        db.query(Sale).delete()
        db.query(Inventory).delete()
        db.query(Material).delete()
        db.query(Vendor).delete()
        db.query(SyncJob).delete()
        db.query(IntegrationLog).delete()
        db.commit()

        # Categories and realistic product naming templates
        categories = {
            "Engine Components": ["Brake Assembly", "Fuel Injector", "Coolant Pump", "Cylinder Head", "Turbocharger", "Piston Ring", "Oil Filter", "Timing Belt"],
            "Electrical Systems": ["Sensor Module V2", "Alternator Unit", "Starter Motor", "Wiring Harness", "Fuse Box", "Control Module", "LED Headlight Assembly"],
            "Hydraulics": ["Hydraulic Cylinder", "Pressure Control Valve", "Fluid Hose 20mm", "Piston Pump", "Hydraulic Seal Kit", "Actuator Assembly"],
            "Fasteners & Seals": ["Standard Fastener Pack", "High-Tensile Bolt M12", "Seal Ring 40mm", "Gasket Set", "Hex Nut Assortment", "Lock Washer 10mm"],
            "Lubricants & Fluids": ["Industrial Lubricant 50L", "Synthetic Engine Oil 5L", "Hydraulic Fluid 20L", "Transmission Fluid", "Coolant Concentrate 10L"],
            "Transmission": ["Transmission Gear P2", "Clutch Plate Assembly", "Drive Shaft Joint", "Differential Gear", "Flywheel Assembly", "Bearing Unit"]
        }

        plants = ["PL01", "PL02", "PL03"]
        countries = ["US", "DE", "IN", "JP", "GB", "CA", "FR"]

        # 3. Seed 50 Vendors
        print("Seeding 50+ vendors...")
        vendors = []
        for i in range(1, 55):
            v_id = f"VEND-{1000 + i}"
            v_name = f"SAP Global Vendor {i} {random.choice(['GmbH', 'Inc.', 'Ltd.', 'Corp.'])}"
            vendors.append(Vendor(
                vendor_id=v_id,
                name=v_name,
                contact_email=f"contact@vendor{i}.com",
                country=random.choice(countries),
                rating=round(random.uniform(3.5, 5.0), 1),
                on_time_delivery_pct=round(random.uniform(75.0, 99.5), 1),
                avg_delay_days=round(random.uniform(0.2, 4.5), 1),
                total_purchase_val=round(random.uniform(50000.0, 1500000.0), 2),
                risk_score=round(random.uniform(5.0, 45.0), 1)
            ))
        db.bulk_save_objects(vendors)
        db.commit()

        # 4. Seed 500+ Materials & Inventory Records
        print("Seeding 500+ materials and inventory records...")
        materials = []
        inventories = []
        alerts = []
        mat_counter = 1001

        all_mat_ids = []

        cat_keys = list(categories.keys())
        for i in range(520):
            mat_id = f"MAT-{mat_counter}"
            all_mat_ids.append(mat_id)
            cat = cat_keys[i % len(cat_keys)]
            naming_template = categories[cat][i % len(categories[cat])]
            desc = f"{naming_template} Spec-{(i % 25) + 1}"
            plant = plants[i % len(plants)]
            unit = "EA" if cat != "Lubricants & Fluids" else "L"
            price = round(random.uniform(12.0, 1450.0), 2)
            abc = "A" if i % 6 == 0 else ("B" if i % 2 == 0 else "C")
            lead_time = random.randint(5, 30)

            min_stk = float(random.randint(50, 300))
            max_stk = min_stk * random.uniform(3.5, 8.0)
            safety_stk = min_stk * 0.5
            reorder_pt = min_stk * 1.3

            materials.append(Material(
                material_id=mat_id,
                description=desc,
                plant=plant,
                category=cat,
                unit=unit,
                unit_price=price,
                abc_classification=abc,
                lead_time_days=lead_time,
                min_stock=min_stk,
                max_stock=max_stk,
                safety_stock=safety_stk,
                reorder_point=reorder_pt
            ))

            # Stock quantity distributions for CRITICAL, LOW, HEALTHY, OVERSTOCK
            if i % 18 == 0:
                current_stk = round(min_stk * random.uniform(0.1, 0.45), 1)  # CRITICAL
            elif i % 8 == 0:
                current_stk = round(min_stk * random.uniform(0.5, 0.95), 1)  # LOW
            elif i % 12 == 0:
                current_stk = round(max_stk * random.uniform(1.1, 1.6), 1)   # OVERSTOCK
            else:
                current_stk = round(random.uniform(min_stk, max_stk), 1)    # HEALTHY

            status = InventoryService.calculate_stock_status(current_stk, min_stk, max_stk)

            inventories.append(Inventory(
                material_id=mat_id,
                plant=plant,
                storage_location=f"SL0{(i % 4) + 1}",
                current_stock=current_stk,
                reserved_stock=round(current_stk * random.uniform(0.02, 0.15), 1),
                incoming_stock=float(random.choice([0, 50, 100, 200]) if status in ["CRITICAL", "LOW"] else 0),
                stock_status=status
            ))

            if status in ["CRITICAL", "LOW"]:
                alerts.append(Alert(
                    alert_type=f"{status}_STOCK",
                    severity="HIGH" if status == "CRITICAL" else "MEDIUM",
                    reference_id=mat_id,
                    material_id=mat_id,
                    message=f"Material {mat_id} ({desc}) current stock ({current_stk}) is in {status} state (Min: {min_stk}).",
                    status="UNRESOLVED"
                ))

            mat_counter += 1

        db.bulk_save_objects(materials)
        db.bulk_save_objects(inventories)
        db.bulk_save_objects(alerts)
        db.commit()

        # 5. Seed 10,000+ Historical Sales Records
        print("Seeding 10,000+ sales records spanning last 90 days...")
        sales = []
        now = datetime.datetime.utcnow()
        for s_idx in range(10200):
            mat_id = random.choice(all_mat_ids)
            days_ago = random.randint(0, 90)
            s_date = now - datetime.timedelta(days=days_ago, hours=random.randint(0, 23))
            qty = float(random.randint(1, 40) if s_idx % 10 != 0 else random.randint(40, 150))
            price = round(random.uniform(20.0, 600.0), 2)
            sales.append(Sale(
                material_id=mat_id,
                plant=random.choice(plants),
                sale_date=s_date,
                quantity=qty,
                unit_price=price,
                total_amount=round(qty * price, 2),
                customer_id=f"CUST-{random.randint(1000, 1050)}"
            ))
        db.bulk_save_objects(sales)
        db.commit()

        # 6. Seed 1,000+ Purchase Orders
        print("Seeding 1,000+ purchase orders...")
        pos = []
        for po_idx in range(1050):
            po_num = f"PO-45000{1000 + po_idx}"
            mat_id = random.choice(all_mat_ids)
            vend_id = f"VEND-{1000 + random.randint(1, 54)}"
            ord_date = now - datetime.timedelta(days=random.randint(1, 60))
            exp_deliv = ord_date + datetime.timedelta(days=random.randint(7, 21))
            status = random.choice(["OPEN", "OPEN", "DELIVERED", "IN_TRANSIT"])
            deliv_status = "DELAYED" if (po_idx % 7 == 0 and status != "DELIVERED") else "ON_TIME"
            qty = float(random.randint(50, 500))
            u_price = round(random.uniform(25.0, 300.0), 2)

            pos.append(PurchaseOrder(
                po_number=po_num,
                material_id=mat_id,
                vendor_id=vend_id,
                plant=random.choice(plants),
                order_date=ord_date,
                expected_delivery=exp_deliv,
                quantity=qty,
                unit_price=u_price,
                total_value=round(qty * u_price, 2),
                status=status,
                delivery_status=deliv_status
            ))
        db.bulk_save_objects(pos)
        db.commit()

        # 7. Initial Sync Job & Integration Logs
        print("Seeding sync job history and integration audit logs...")
        sync_job = SyncJob(
            job_id="SYNC-INIT-001",
            source="SAP_MOCK",
            started_at=now - datetime.timedelta(minutes=5),
            completed_at=now - datetime.timedelta(minutes=4),
            records_fetched=570,
            records_processed=570,
            records_failed=0,
            duration_seconds=1.85,
            status="COMPLETED",
            error_summary=None
        )
        db.add(sync_job)

        log1 = IntegrationLog(
            timestamp=now - datetime.timedelta(minutes=5),
            service="SAP_MATERIAL_SRV",
            http_method="GET",
            endpoint="/MaterialSet",
            status_code=200,
            latency_ms=124.5,
            request_id="REQ-INIT-01",
            success=True
        )
        log2 = IntegrationLog(
            timestamp=now - datetime.timedelta(minutes=5),
            service="SAP_INVENTORY_SRV",
            http_method="GET",
            endpoint="/InventorySet",
            status_code=200,
            latency_ms=98.2,
            request_id="REQ-INIT-02",
            success=True
        )
        db.add(log1)
        db.add(log2)
        db.commit()

        print("Database seeding completed successfully!")
        print(f"Summary: {len(materials)} materials, {len(vendors)} vendors, {len(sales)} sales, {len(pos)} purchase orders.")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed with error: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
