\restrict Rcgk1niuxjI5AfFIAeyRamd2wrhLb6YsB5NVADwDAC7PKKFgOokUpqSL4zfAWTB
ALTER TABLE IF EXISTS ONLY stripe.prices DROP CONSTRAINT IF EXISTS prices_product_fkey;
ALTER TABLE IF EXISTS ONLY messages DROP CONSTRAINT IF EXISTS messages_conversation_id_conversations_id_fk;
DROP INDEX IF EXISTS "IDX_session_expire";
DROP INDEX IF EXISTS "IDX_auth_token_expires";
ALTER TABLE IF EXISTS ONLY stripe.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY stripe.prices DROP CONSTRAINT IF EXISTS prices_pkey;
ALTER TABLE IF EXISTS ONLY stripe.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY stripe._migrations DROP CONSTRAINT IF EXISTS _migrations_pkey;
ALTER TABLE IF EXISTS ONLY stripe._migrations DROP CONSTRAINT IF EXISTS _migrations_name_key;
ALTER TABLE IF EXISTS ONLY users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_unique;
ALTER TABLE IF EXISTS ONLY subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY reports DROP CONSTRAINT IF EXISTS reports_pkey;
ALTER TABLE IF EXISTS ONLY messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY machines DROP CONSTRAINT IF EXISTS machines_pkey;
ALTER TABLE IF EXISTS ONLY invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_unique;
ALTER TABLE IF EXISTS ONLY fuel_entries DROP CONSTRAINT IF EXISTS fuel_entries_pkey;
ALTER TABLE IF EXISTS ONLY conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY company_profiles DROP CONSTRAINT IF EXISTS company_profiles_user_id_unique;
ALTER TABLE IF EXISTS ONLY company_profiles DROP CONSTRAINT IF EXISTS company_profiles_pkey;
ALTER TABLE IF EXISTS ONLY auth_tokens DROP CONSTRAINT IF EXISTS auth_tokens_pkey;
ALTER TABLE IF EXISTS messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS conversations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS stripe.products;
DROP TABLE IF EXISTS stripe.prices;
DROP TABLE IF EXISTS stripe.customers;
DROP TABLE IF EXISTS stripe._migrations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS reports;
DROP SEQUENCE IF EXISTS messages_id_seq;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS fuel_entries;
DROP SEQUENCE IF EXISTS conversations_id_seq;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS company_profiles;
DROP TABLE IF EXISTS auth_tokens;
DROP TYPE IF EXISTS stripe.pricing_type;
DROP TYPE IF EXISTS stripe.pricing_tiers;
DROP TYPE IF EXISTS taxas_status;
DROP TYPE IF EXISTS taxas_activity;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS plate_color;
DROP TYPE IF EXISTS machine_type;
DROP TYPE IF EXISTS fuel_type;
DROP TYPE IF EXISTS auth_provider;
DROP SCHEMA IF EXISTS stripe;
CREATE SCHEMA stripe;
CREATE TYPE auth_provider AS ENUM (
    'replit',
    'local'
);
CREATE TYPE fuel_type AS ENUM (
    'diesel',
    'gasoline',
    'biodiesel'
);
CREATE TYPE machine_type AS ENUM (
    'excavator',
    'spider_excavator',
    'loader',
    'crane',
    'drill',
    'finisher',
    'milling_machine',
    'roller',
    'dumper',
    'forklift',
    'crusher',
    'generator',
    'compressor',
    'concrete_pump',
    'other'
);
CREATE TYPE plate_color AS ENUM (
    'white',
    'green',
    'yellow',
    'blue',
    'none'
);
CREATE TYPE subscription_status AS ENUM (
    'trial',
    'trial_expired',
    'active',
    'cancelled',
    'inactive'
);
CREATE TYPE taxas_activity AS ENUM (
    'agriculture_with_direct',
    'agriculture_without_direct',
    'forestry',
    'rinsing',
    'concession_transport',
    'natural_stone',
    'snow_groomer',
    'professional_fishing',
    'stationary_generator',
    'stationary_cleaning',
    'stationary_combustion',
    'construction',
    'other_taxas'
);
CREATE TYPE taxas_status AS ENUM (
    'draft',
    'ready_for_taxas',
    'submitted_to_taxas',
    'approved'
);
CREATE TYPE stripe.pricing_tiers AS ENUM (
    'graduated',
    'volume'
);
CREATE TYPE stripe.pricing_type AS ENUM (
    'one_time',
    'recurring'
);
CREATE TABLE auth_tokens (
    token character varying NOT NULL,
    user_data jsonb NOT NULL,
    expires_at timestamp without time zone NOT NULL
);
CREATE TABLE company_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    company_name text NOT NULL,
    ide_number text,
    street text,
    postal_code text,
    city text,
    canton text,
    country text DEFAULT 'Suisse'::text,
    contact_name text,
    contact_email text,
    contact_phone text,
    bank_name text,
    iban text,
    bic text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
CREATE TABLE conversations (
    id integer NOT NULL,
    title text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE conversations_id_seq OWNED BY public.conversations.id;
CREATE TABLE fuel_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    machine_id character varying NOT NULL,
    invoice_date timestamp without time zone NOT NULL,
    invoice_number text,
    volume_liters real NOT NULL,
    engine_hours real,
    fuel_type fuel_type DEFAULT 'diesel'::public.fuel_type NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    invoice_number text NOT NULL,
    amount_paid real NOT NULL,
    currency text DEFAULT 'CHF'::text NOT NULL,
    promo_code_used text,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE machines (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    name text NOT NULL,
    type machine_type NOT NULL,
    chassis_number text,
    year integer,
    is_eligible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    power text,
    taxas_activity taxas_activity DEFAULT 'construction'::public.taxas_activity,
    license_plate text,
    plate_color plate_color DEFAULT 'none'::public.plate_color
);
CREATE TABLE messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE messages_id_seq OWNED BY public.messages.id;
CREATE TABLE reports (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    total_volume_liters real NOT NULL,
    eligible_volume_liters real NOT NULL,
    reimbursement_amount real NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    language text DEFAULT 'fr'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    taxas_status taxas_status DEFAULT 'draft'::public.taxas_status,
    taxas_submission_ref text,
    taxas_submitted_at timestamp without time zone
);
CREATE TABLE sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);
CREATE TABLE subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    status subscription_status DEFAULT 'trial'::public.subscription_status NOT NULL,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    trial_start_at timestamp without time zone DEFAULT now(),
    trial_ends_at timestamp without time zone,
    trial_reminder_sent boolean DEFAULT false,
    quarterly_reminder_last_sent timestamp without time zone
);
CREATE TABLE users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_hash character varying,
    auth_provider auth_provider DEFAULT 'replit'::public.auth_provider,
    password_set boolean DEFAULT false,
    password_reset_token character varying,
    password_reset_expires timestamp without time zone
);
CREATE TABLE stripe._migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE stripe.customers (
    id text NOT NULL,
    object text,
    address jsonb,
    description text,
    email text,
    metadata jsonb,
    name text,
    phone text,
    shipping jsonb,
    balance integer,
    created integer,
    currency text,
    default_source text,
    delinquent boolean,
    discount jsonb,
    invoice_prefix text,
    invoice_settings jsonb,
    livemode boolean,
    next_invoice_sequence integer,
    preferred_locales jsonb,
    tax_exempt text
);
CREATE TABLE stripe.prices (
    id text NOT NULL,
    object text,
    active boolean,
    currency text,
    metadata jsonb,
    nickname text,
    recurring jsonb,
    type stripe.pricing_type,
    unit_amount integer,
    billing_scheme text,
    created integer,
    livemode boolean,
    lookup_key text,
    tiers_mode stripe.pricing_tiers,
    transform_quantity jsonb,
    unit_amount_decimal text,
    product text
);
CREATE TABLE stripe.products (
    id text NOT NULL,
    object text,
    active boolean,
    description text,
    metadata jsonb,
    name text,
    created integer,
    images jsonb,
    livemode boolean,
    package_dimensions jsonb,
    shippable boolean,
    statement_descriptor text,
    unit_label text,
    updated integer,
    url text
);
ALTER TABLE ONLY conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);
ALTER TABLE ONLY messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
ALTER TABLE ONLY auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (token);
ALTER TABLE ONLY company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY company_profiles
    ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE ONLY conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fuel_entries
    ADD CONSTRAINT fuel_entries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);
ALTER TABLE ONLY invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);
ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);
ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);
ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
CREATE INDEX "IDX_auth_token_expires" ON auth_tokens USING btree (expires_at);
CREATE INDEX "IDX_session_expire" ON sessions USING btree (expire);
ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_product_fkey FOREIGN KEY (product) REFERENCES stripe.products(id);
\unrestrict Rcgk1niuxjI5AfFIAeyRamd2wrhLb6YsB5NVADwDAC7PKKFgOokUpqSL4zfAWTB
