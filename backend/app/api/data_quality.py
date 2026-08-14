import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Material, Inventory, Vendor, PurchaseOrder
from app.schemas import DataQualityResponse, DataQualityCheck

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])

@router.get("", response_model=DataQualityResponse)
def get_data_quality_report(db: Session = Depends(get_db)):
    total_materials = db.query(Material).count() or 1
    total_inventory = db.query(Inventory).count() or 1

    checks = []

    # 1. Missing material description
    missing_desc = db.query(Material).filter(
        (Material.description == None) | (Material.description == "")
    ).count()
    checks.append(DataQualityCheck(
        rule_name="Material Description Complete",
        category="Completeness",
        passed=missing_desc == 0,
        failed_count=missing_desc,
        description="Verifies every material record has a non-empty description."
    ))

    # 2. Negative inventory quantity
    neg_stock = db.query(Inventory).filter(Inventory.current_stock < 0).count()
    checks.append(DataQualityCheck(
        rule_name="Non-Negative Inventory Stock",
        category="Validity",
        passed=neg_stock == 0,
        failed_count=neg_stock,
        description="Checks for corrupted records with physical inventory below 0."
    ))

    # 3. Missing unit measurement
    missing_unit = db.query(Material).filter(
        (Material.unit == None) | (Material.unit == "")
    ).count()
    checks.append(DataQualityCheck(
        rule_name="Unit of Measure Assigned",
        category="Completeness",
        passed=missing_unit == 0,
        failed_count=missing_unit,
        description="Ensures every SKU has an SAP unit of measure (e.g. EA, L, KG)."
    ))

    # 4. Zero Unit Price Check
    zero_price = db.query(Material).filter(Material.unit_price <= 0).count()
    checks.append(DataQualityCheck(
        rule_name="Valid Material Unit Valuation",
        category="Valuation",
        passed=zero_price == 0,
        failed_count=zero_price,
        description="Flags materials missing unit price valuation in SAP master data."
    ))

    # 5. Invalid plant code
    valid_plants = ["PL01", "PL02", "PL03"]
    invalid_plant = db.query(Inventory).filter(~Inventory.plant.in_(valid_plants)).count()
    checks.append(DataQualityCheck(
        rule_name="Standard Plant Assignment",
        category="Consistency",
        passed=invalid_plant == 0,
        failed_count=invalid_plant,
        description="Verifies inventory is mapped to recognized SAP organizational plants."
    ))

    # Compute overall quality score formula
    failed_total = sum(c.failed_count for c in checks)
    max_records = total_materials + total_inventory
    overall_score = max(0.0, round(100.0 - ((failed_total / max_records) * 100.0), 1))

    return DataQualityResponse(
        overall_score=overall_score,
        total_records_checked=max_records,
        checks=checks,
        last_checked=datetime.datetime.utcnow()
    )
