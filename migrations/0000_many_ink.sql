CREATE TYPE "public"."fuel_type" AS ENUM('diesel', 'gasoline', 'biodiesel');--> statement-breakpoint
CREATE TYPE "public"."machine_type" AS ENUM('excavator', 'spider_excavator', 'loader', 'crane', 'drill', 'finisher', 'milling_machine', 'roller', 'dumper', 'forklift', 'crusher', 'generator', 'compressor', 'concrete_pump', 'other');--> statement-breakpoint
CREATE TYPE "public"."plate_color" AS ENUM('white', 'green', 'yellow', 'blue', 'none');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'trial_expired', 'active', 'cancelled', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."taxas_activity" AS ENUM('agriculture_with_direct', 'agriculture_without_direct', 'forestry', 'rinsing', 'concession_transport', 'natural_stone', 'snow_groomer', 'professional_fishing', 'stationary_generator', 'stationary_cleaning', 'stationary_combustion', 'construction', 'other_taxas');--> statement-breakpoint
CREATE TYPE "public"."taxas_status" AS ENUM('draft', 'ready_for_taxas', 'submitted_to_taxas', 'approved');--> statement-breakpoint
CREATE TYPE "public"."activity_sector" AS ENUM('agriculture', 'btp');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('replit', 'local');--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_name" text NOT NULL,
	"ide_number" text,
	"rc_number" text,
	"tax_subject_number" text,
	"attribution_99" text,
	"street" text,
	"postal_code" text,
	"city" text,
	"canton" text,
	"country" text DEFAULT 'Suisse',
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"bank_name" text,
	"iban" text,
	"bic" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "fuel_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"machine_id" varchar NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"invoice_number" text,
	"volume_liters" real NOT NULL,
	"engine_hours" real,
	"fuel_type" "fuel_type" DEFAULT 'diesel' NOT NULL,
	"article_number" text,
	"warehouse_number" text,
	"movement_number" text,
	"bd" text,
	"stat" text,
	"ci" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"invoice_number" text NOT NULL,
	"amount_paid" real NOT NULL,
	"currency" text DEFAULT 'CHF' NOT NULL,
	"promo_code_used" text,
	"stripe_session_id" text,
	"stripe_invoice_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" "machine_type" NOT NULL,
	"custom_type" text,
	"taxas_activity" "taxas_activity" DEFAULT 'construction',
	"license_plate" text,
	"plate_color" "plate_color" DEFAULT 'none',
	"chassis_number" text,
	"registration_number" text,
	"rc_number" text,
	"year" integer,
	"power" text,
	"is_eligible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_volume_liters" real NOT NULL,
	"eligible_volume_liters" real NOT NULL,
	"reimbursement_amount" real NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"taxas_status" "taxas_status" DEFAULT 'draft',
	"taxas_submission_ref" text,
	"taxas_submitted_at" timestamp,
	"language" text DEFAULT 'fr' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"trial_start_at" timestamp DEFAULT now(),
	"trial_ends_at" timestamp,
	"trial_reminder_sent" boolean DEFAULT false,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"quarterly_reminder_last_sent" timestamp,
	"renewal_reminder_30_days_sent" timestamp,
	"renewal_reminder_7_days_sent" timestamp,
	"renewal_reminder_1_day_sent" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"token" varchar PRIMARY KEY NOT NULL,
	"user_data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "lucia_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"password_hash" varchar,
	"auth_provider" "auth_provider" DEFAULT 'replit',
	"password_set" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"password_reset_token" varchar,
	"password_reset_expires" timestamp,
	"first_name" varchar,
	"last_name" varchar,
	"activity_sector" "activity_sector",
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lucia_sessions" ADD CONSTRAINT "lucia_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_auth_token_expires" ON "auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");