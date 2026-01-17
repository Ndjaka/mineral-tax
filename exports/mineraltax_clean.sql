-- ============================================
-- MineralTax Swiss - PostgreSQL Schema
-- Version: Production Ready
-- Date: 2026-01-17
-- ============================================

-- Types énumérés
CREATE TYPE auth_provider AS ENUM ('replit', 'local');
CREATE TYPE fuel_type AS ENUM ('diesel', 'gasoline', 'biodiesel');
CREATE TYPE machine_type AS ENUM (
    'excavator', 'spider_excavator', 'loader', 'crane', 'drill',
    'finisher', 'milling_machine', 'roller', 'dumper', 'forklift',
    'crusher', 'generator', 'compressor', 'concrete_pump', 'other'
);
CREATE TYPE plate_color AS ENUM ('white', 'green', 'yellow', 'blue', 'none');
CREATE TYPE subscription_status AS ENUM ('trial', 'trial_expired', 'active', 'cancelled', 'inactive');
CREATE TYPE taxas_activity AS ENUM (
    'agriculture_with_direct', 'agriculture_without_direct', 'forestry',
    'rinsing', 'concession_transport', 'natural_stone', 'snow_groomer',
    'professional_fishing', 'stationary_generator', 'stationary_cleaning',
    'stationary_combustion', 'construction'
);
CREATE TYPE taxas_status AS ENUM ('draft', 'ready_for_taxas', 'submitted_to_taxas', 'approved');

-- Table utilisateurs
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(512),
    password_hash VARCHAR(255),
    auth_provider auth_provider DEFAULT 'replit',
    password_set BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table sessions
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX idx_session_expire ON sessions(expire);

-- Table tokens d'authentification
CREATE TABLE auth_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_auth_token_expires ON auth_tokens(expires_at);

-- Table abonnements
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    status subscription_status DEFAULT 'trial',
    trial_start TIMESTAMP DEFAULT NOW(),
    trial_end TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table profils entreprise
CREATE TABLE company_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(100),
    ide_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    canton VARCHAR(2),
    country VARCHAR(2) DEFAULT 'CH',
    phone VARCHAR(20),
    email VARCHAR(255),
    iban VARCHAR(34),
    bank_name VARCHAR(255),
    taxas_registered BOOLEAN DEFAULT false,
    taxas_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table machines/véhicules
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type machine_type NOT NULL,
    chassis_number VARCHAR(100),
    year INTEGER,
    power_kw NUMERIC(10,2),
    fuel_type fuel_type DEFAULT 'diesel',
    plate_color plate_color DEFAULT 'none',
    plate_number VARCHAR(20),
    is_eligible BOOLEAN DEFAULT true,
    eligibility_override BOOLEAN DEFAULT false,
    taxas_activity taxas_activity,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table entrées de carburant
CREATE TABLE fuel_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    machine_id INTEGER NOT NULL,
    date DATE NOT NULL,
    volume_liters NUMERIC(10,2) NOT NULL,
    fuel_type fuel_type DEFAULT 'diesel',
    invoice_number VARCHAR(100),
    invoice_date DATE,
    supplier VARCHAR(255),
    unit_price NUMERIC(10,4),
    total_amount NUMERIC(10,2),
    is_eligible BOOLEAN DEFAULT true,
    notes TEXT,
    ocr_processed BOOLEAN DEFAULT false,
    ocr_confidence NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table rapports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_volume NUMERIC(12,2) NOT NULL,
    eligible_volume NUMERIC(12,2) NOT NULL,
    reimbursement_amount NUMERIC(12,2) NOT NULL,
    machine_count INTEGER DEFAULT 0,
    entry_count INTEGER DEFAULT 0,
    taxas_status taxas_status DEFAULT 'draft',
    taxas_submission_ref VARCHAR(100),
    taxas_submitted_at TIMESTAMP,
    pdf_generated BOOLEAN DEFAULT false,
    csv_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table factures
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CHF',
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    pdf_url VARCHAR(512),
    stripe_invoice_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table conversations (assistant IA)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table messages (assistant IA)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Fin du schéma MineralTax
-- ============================================
