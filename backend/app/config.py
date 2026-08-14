import os
from typing import List, Union
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SAP Inventory Integration & Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sap_inventory.db")

    # SAP Integration Settings
    SAP_MODE: str = os.getenv("SAP_MODE", "mock")  # 'mock' or 'real'
    SAP_BASE_URL: str = os.getenv("SAP_BASE_URL", "https://sap-s4hana.internal:50000")
    SAP_CLIENT: str = os.getenv("SAP_CLIENT", "100")
    SAP_USERNAME: str = os.getenv("SAP_USERNAME", "SAP_INT_USER")
    SAP_PASSWORD: str = os.getenv("SAP_PASSWORD", "")
    SAP_API_PATH: str = os.getenv("SAP_API_PATH", "/sap/opu/odata/sap/ZINVENTORY_SRV")
    SAP_TIMEOUT: int = int(os.getenv("SAP_TIMEOUT", "30"))

    # Groq AI Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Security & CORS
    CORS_ORIGINS: Union[str, List[str]] = os.getenv("CORS_ORIGINS", "*")

settings = Settings()
