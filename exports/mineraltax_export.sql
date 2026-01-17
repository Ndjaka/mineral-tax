\restrict vlDYUwdpFaCVarJoe5ax83eGYpoyLbdpleQrilBaUWyL5BmT03Rj6UaJBxK2xl0
CREATE SCHEMA stripe;
CREATE TYPE public.auth_provider AS ENUM (
    'replit',
    'local'
);
CREATE TYPE public.fuel_type AS ENUM (
    'diesel',
    'gasoline',
    'biodiesel'
);
CREATE TYPE public.machine_type AS ENUM (
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
CREATE TYPE public.plate_color AS ENUM (
    'white',
    'green',
    'yellow',
    'blue',
    'none'
);
CREATE TYPE public.subscription_status AS ENUM (
    'trial',
    'trial_expired',
    'active',
    'cancelled',
    'inactive'
);
CREATE TYPE public.taxas_activity AS ENUM (
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
CREATE TYPE public.taxas_status AS ENUM (
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
CREATE TABLE public.auth_tokens (
    token character varying NOT NULL,
    user_data jsonb NOT NULL,
    expires_at timestamp without time zone NOT NULL
);
CREATE TABLE public.company_profiles (
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
CREATE TABLE public.conversations (
    id integer NOT NULL,
    title text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;
CREATE TABLE public.fuel_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    machine_id character varying NOT NULL,
    invoice_date timestamp without time zone NOT NULL,
    invoice_number text,
    volume_liters real NOT NULL,
    engine_hours real,
    fuel_type public.fuel_type DEFAULT 'diesel'::public.fuel_type NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    invoice_number text NOT NULL,
    amount_paid real NOT NULL,
    currency text DEFAULT 'CHF'::text NOT NULL,
    promo_code_used text,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.machines (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    name text NOT NULL,
    type public.machine_type NOT NULL,
    chassis_number text,
    year integer,
    is_eligible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    power text,
    taxas_activity public.taxas_activity DEFAULT 'construction'::public.taxas_activity,
    license_plate text,
    plate_color public.plate_color DEFAULT 'none'::public.plate_color
);
CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
CREATE TABLE public.reports (
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
    taxas_status public.taxas_status DEFAULT 'draft'::public.taxas_status,
    taxas_submission_ref text,
    taxas_submitted_at timestamp without time zone
);
CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);
CREATE TABLE public.subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    status public.subscription_status DEFAULT 'trial'::public.subscription_status NOT NULL,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    trial_start_at timestamp without time zone DEFAULT now(),
    trial_ends_at timestamp without time zone,
    trial_reminder_sent boolean DEFAULT false,
    quarterly_reminder_last_sent timestamp without time zone
);
CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_hash character varying,
    auth_provider public.auth_provider DEFAULT 'replit'::public.auth_provider,
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
ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);
ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (token);
ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fuel_entries
    ADD CONSTRAINT fuel_entries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);
ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);
ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE ONLY public.users
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
CREATE INDEX "IDX_auth_token_expires" ON public.auth_tokens USING btree (expires_at);
CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_product_fkey FOREIGN KEY (product) REFERENCES stripe.products(id);
\unrestrict vlDYUwdpFaCVarJoe5ax83eGYpoyLbdpleQrilBaUWyL5BmT03Rj6UaJBxK2xl0
