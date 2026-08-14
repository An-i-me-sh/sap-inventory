-- PostgreSQL Initializer Script for SAP Inventory Integration & Intelligence Platform
CREATE DATABASE sap_inventory;
\connect sap_inventory;

-- Extension setup if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
