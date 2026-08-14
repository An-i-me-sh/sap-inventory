# SAP ABAP Data Extraction Components

This directory contains representative ABAP source code programs for SAP S/4HANA & SAP ECC systems.

## Included ABAP Programs

1. **`ZINVENTORY_EXPORT.abap`**:
   - Performs inner join across `MARA` (Material Master), `MAKT` (Material Descriptions), and `MARD` (Storage Location Data for Material).
   - Extracts stock quantities (`LABST`, `INSME`, `SPEME`) per plant/storage location.
   - Serializes output to JSON format using `/ui2/cl_json` for consumption by OData / FastAPI services.

2. **`ZSALES_EXPORT.abap`**:
   - Joins `VBRK` (Billing Document Header) and `VBRP` (Billing Document Item).
   - Extracts historical sales billing quantities and net values for ML demand forecasting model training.

3. **`ZPURCHASE_ORDER_EXPORT.abap`**:
   - Joins `EKKO` (PO Header), `EKPO` (PO Item), and `EKET` (Delivery Schedules).
   - Extracts open purchase orders, vendor references (`LIFNR`), and scheduled delivery dates (`EINDT`).

## OData Gateway Configuration (SE80 / SEGW)

To register these extraction functions as an OData service in SAP S/4HANA:
1. Open transaction `SEGW` (SAP Gateway Service Builder).
2. Create project `ZINVENTORY_SRV`.
3. Import data structures from `ty_inventory`, `ty_sales`, and `ty_po`.
4. Generate runtime objects and activate in transaction `/IWFND/MAINT_SERVICE`.
5. Set backend `SAP_MODE=real` and configure `SAP_BASE_URL` to target `/sap/opu/odata/sap/ZINVENTORY_SRV`.
