-- ============================================
-- MineralTax Swiss - PostgreSQL Schema
-- Version compatible toutes versions PostgreSQL
-- Date: 2026-01-17
-- ============================================

-- Suppression sécurisée des types (compatible anciennes versions)
DO $$ BEGIN
    DROP TYPE IF EXISTS auth_provider CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS fuel_type CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS machine_type CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS plate_color CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS subscription_status CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS taxas_activity CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS taxas_status CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

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
    'stationary_combustion', 'construction', 'other_taxas'
);

CREATE TYPE taxas_status AS ENUM ('draft', 'ready_for_taxas', 'submitted_to_taxas', 'approved');

-- ============================================
-- Table utilisateurs
-- ============================================
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(512),
    password_hash VARCHAR(255),
    auth_provider auth_provider DEFAULT 'local',
    password_set BOOLEAN DEFAULT false,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table sessions (pour express-session)
-- ============================================
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_expire ON sessions(expire);

-- ============================================
-- Table tokens authentification
-- ============================================
CREATE TABLE auth_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_token_expires ON auth_tokens(expires_at);

-- ============================================
-- Table abonnements
-- ============================================
CREATE TABLE subscriptions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status subscription_status NOT NULL DEFAULT 'trial',
    trial_start_at TIMESTAMP DEFAULT NOW(),
    trial_ends_at TIMESTAMP,
    trial_reminder_sent BOOLEAN DEFAULT false,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    quarterly_reminder_last_sent TIMESTAMP,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table factures
-- ============================================
CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    amount_paid REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    promo_code_used TEXT,
    stripe_session_id TEXT,
    stripe_invoice_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table profils entreprise
-- ============================================
CREATE TABLE company_profiles (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    ide_number TEXT,
    street TEXT,
    postal_code TEXT,
    city TEXT,
    canton TEXT,
    country TEXT DEFAULT 'Suisse',
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    bank_name TEXT,
    iban TEXT,
    bic TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table machines (flotte)
-- ============================================
CREATE TABLE machines (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type machine_type NOT NULL,
    custom_type TEXT,
    taxas_activity taxas_activity DEFAULT 'construction',
    license_plate TEXT,
    plate_color plate_color DEFAULT 'none',
    chassis_number TEXT,
    year INTEGER,
    power TEXT,
    is_eligible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_machines_user ON machines(user_id);

-- ============================================
-- Table entrées carburant
-- ============================================
CREATE TABLE fuel_entries (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id VARCHAR(255) NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    invoice_date TIMESTAMP NOT NULL,
    invoice_number TEXT,
    volume_liters REAL NOT NULL,
    engine_hours REAL,
    fuel_type fuel_type NOT NULL DEFAULT 'diesel',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fuel_entries_user ON fuel_entries(user_id);
CREATE INDEX idx_fuel_entries_machine ON fuel_entries(machine_id);
CREATE INDEX idx_fuel_entries_date ON fuel_entries(invoice_date);

-- ============================================
-- Table rapports
-- ============================================
CREATE TABLE reports (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_volume_liters REAL NOT NULL,
    eligible_volume_liters REAL NOT NULL,
    reimbursement_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    taxas_status taxas_status DEFAULT 'draft',
    taxas_submission_ref TEXT,
    taxas_submitted_at TIMESTAMP,
    language TEXT NOT NULL DEFAULT 'fr',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_user ON reports(user_id);

-- ============================================
-- Table conversations (assistant IA)
-- ============================================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table messages (assistant IA)
-- ============================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- ============================================
-- Fonction de nettoyage des sessions expirées
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expire < NOW();
    DELETE FROM auth_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Notes importantes pour Infomaniak
-- ============================================
-- 
-- 1. Variables d'environnement requises :
--    - DATABASE_URL : postgresql://user:pass@host:5432/db?sslmode=require
--    - SESSION_SECRET : clé secrète 32+ caractères
--    - STRIPE_SECRET_KEY : sk_live_...
--    - STRIPE_PUBLISHABLE_KEY : pk_live_...
--    - STRIPE_WEBHOOK_SECRET : whsec_...
--    - OPENAI_API_KEY : sk-... (optionnel)
--
-- 2. Authentification :
--    - auth_provider = 'local' pour les nouveaux utilisateurs
--    - password_hash utilise bcrypt avec facteur 12
--
-- 3. Taux de remboursement OFDF :
--    - 0.3405 CHF par litre de carburant éligible
--
-- ============================================
