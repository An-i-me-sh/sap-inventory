# SAP Inventory Integration & Intelligence Platform

A production-grade full-stack enterprise application integrating SAP S/4HANA & ABAP business data abstractions with a Python FastAPI backend engine, PostgreSQL database, machine-learning demand forecasting (`scikit-learn`), deterministic replenishment recommendation logic, optional Groq LLM explanations, and a React frontend adhering strictly to the Stitch industrial design system (`technical_inventory_ledger`).

---

## 🏛️ System Architecture

```
                               ┌───────────────────────────┐
                               │  SAP S/4HANA / ABAP ERP   │
                               │  (ZINVENTORY_EXPORT etc.) │
                               └─────────────┬─────────────┘
                                             │ (OData / REST HTTP)
                                             ▼
                               ┌───────────────────────────┐
                               │  SAP Integration Layer    │
                               │  (MockSAP / RealSAP)      │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
┌──────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│   React Frontend (Vite)  │ ◄─┤   FastAPI Backend Engine  │ ◄─┤ PostgreSQL / SQLite DB    │
│  Stitch Design System    │   │  (Async REST Endpoints)   │   │ (Materials, Inventory, PO)│
└──────────────────────────┘   └─────────────┬─────────────┘   └───────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │   ML Demand Forecaster    │               │  Groq AI Explanation      │
         │  RandomForestRegressor    │               │  (Controlled NL Queries)  │
         └───────────────────────────┘               └───────────────────────────┘
```

---

## 🚀 Key Features & Capabilities

- **Stitch Design System Fidelity**: High-density technical ledger layout built with IBM Plex Sans & IBM Plex Mono typography, 0px border-radius, flat elevation, and dark/light mode persistence.
- **SAP Integration & Mock Engine**:
  - `SAP_MODE=mock`: Simulates realistic SAP S/4HANA OData payloads flowing through FastAPI, DB, and Frontend without needing live SAP infrastructure.
  - `SAP_MODE=real`: Connects directly to SAP Gateway OData endpoints (`/sap/opu/odata/sap/ZINVENTORY_SRV`).
  - **Honesty Rule**: Interface clearly displays `"Mock SAP Environment"` or `"SAP Connected"`.
- **Deterministic Replenishment Engine**:
  $$\text{available\_stock} = \text{current\_stock} + \text{incoming\_stock}$$
  $$\text{required\_stock} = \text{predicted\_demand} + \text{safety\_stock}$$
  $$\text{recommended\_order} = \max(0, \text{required\_stock} - \text{available\_stock})$$
- **Machine Learning Demand Forecasting**: `RandomForestRegressor` model predicting 7, 30, 60, and 90-day demand with confidence bounds and accuracy evaluation (MAE, RMSE, MAPE).
- **Groq AI Business Intelligence**: Optional natural-language query engine (`POST /api/ai/query`) providing executive explanations of verified backend analytics without executing arbitrary SQL.
- **Complete Module Coverage**:
  1. Dashboard Overview
  2. Technical Inventory Ledger
  3. Material Master Catalog & Detail Breakdown
  4. Machine Learning Demand Forecast
  5. Analytics & Inventory Valuation
  6. AI Insights & Controlled Q&A
  7. Purchase Orders & Procurement Schedule
  8. Vendors Performance & Risk Metrics
  9. Operational Stock Alerts
  10. SAP Integration Architecture & Payload Inspector
  11. Sync Monitor
  12. Integration Audit Logs
  13. Data Quality Audit & Rules Engine
  14. Settings & Diagnostics
  15. Global Search Modal (Ctrl+K) & Notification Drawer

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, TailwindCSS (Stitch Palette), Axios, Material Symbols Outlined |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, HTTPX, Pandas, Scikit-learn, Groq SDK |
| **Database** | PostgreSQL 15 (fallback SQLite support for fast local dev) |
| **ABAP ERP** | ABAP Open SQL, JSON Serializer (`/ui2/cl_json`), OData Gateway Service Builder (`SEGW`) |
| **Containerization**| Docker, Docker Compose, Nginx |

---

## 📂 Project Structure

```
stitch_sap_inventory_integration_platform/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI Endpoint Routers
│   │   ├── ml/              # Scikit-learn Forecasting Engine
│   │   ├── services/        # Business Logic & SAP Provider Abstractions
│   │   ├── config.py        # Environment Configuration Settings
│   │   ├── database.py      # SQLAlchemy Session & Engine Management
│   │   ├── main.py          # FastAPI Main Entrypoint
│   │   ├── models.py        # Database ORM Models
│   │   └── schemas.py       # Pydantic Schemas
│   ├── tests/               # Pytest Unit Tests
│   ├── requirements.txt     # Python Dependencies
│   ├── seed.py              # Deterministic Database Seeder
│   └── Dockerfile           # Backend Container Definition
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Centralized Axios API Client Layer
│   │   ├── components/      # Reusable UI Components (Sidebar, Header, MetricBlock)
│   │   ├── pages/           # 15 Complete Page Views
│   │   ├── App.jsx          # Route Mapping & Overlay Modals
│   │   ├── index.css        # Stitch Design System Tokens & Themes
│   │   └── main.jsx         # React Entry Point
│   ├── package.json
│   ├── tailwind.config.js   # Stitch Custom Extensions
│   └── Dockerfile           # Nginx Production Container
│
├── abap/                    # SAP ABAP Selection Programs & OData Guides
│   ├── ZINVENTORY_EXPORT.abap
│   ├── ZSALES_EXPORT.abap
│   ├── ZPURCHASE_ORDER_EXPORT.abap
│   ├── ZVENDOR_EXPORT.abap
│   └── README.md
│
├── database/
│   └── init.sql             # PostgreSQL Initialization Script
│
├── docker-compose.yml       # Full Multi-container Orchestration
├── .env.example             # Environment Variable Template
└── README.md
```

---

## ⚡ Local Setup & Execution Guide

### Option A: Using Docker Compose (Recommended)

1. Clone repository and set up environment:
   ```bash
   cp .env.example .env
   ```
2. Launch containers:
   ```bash
   docker compose up --build
   ```
3. Access the application:
   - **Frontend**: http://localhost:3000
   - **FastAPI OpenAPI Swagger Docs**: http://localhost:8000/docs
   - **Backend Health**: http://localhost:8000/api/health

---

### Option B: Running Locally (Python + Node.js)

#### 1. Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# Activate on Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run deterministic database seeder (seeds 500+ materials, 50+ vendors, 10,000+ sales)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
Open browser to `http://localhost:3000`.

---

## 🧪 Running Automated Unit Tests

Execute pytest from the root or backend folder:
```bash
pytest backend/tests
```

Includes test validation for Section 53 business logic requirement:
$$\text{Current Stock}=100, \text{Incoming}=20, \text{Predicted Demand}=180, \text{Safety Stock}=30$$
$$\implies \text{Available}=120, \text{Required}=210, \text{Recommended Order}=90$$

---

## 🔐 Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./sap_inventory.db` | PostgreSQL or SQLite database URI |
| `SAP_MODE` | `mock` | `mock` for local SAP simulation, `real` for live SAP S/4HANA |
| `SAP_BASE_URL` | `https://sap-s4hana.internal:50000` | SAP Gateway Server URL |
| `SAP_CLIENT` | `100` | SAP Mandant Client ID |
| `SAP_USERNAME` | `SAP_INT_USER` | SAP Integration Service User |
| `SAP_PASSWORD` | `""` | SAP Integration User Password |
| `SAP_API_PATH` | `/sap/opu/odata/sap/ZINVENTORY_SRV` | SAP OData Service Path |
| `GROQ_API_KEY` | `""` | Optional Groq API Key for LLM natural-language explanations |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |
