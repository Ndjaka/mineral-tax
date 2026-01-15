# MineralTax Swiss - Swiss Mineral Oil Tax Reimbursement SaaS

## Overview
Professional SaaS application for Swiss mineral oil tax (Mineralölsteuer) reimbursement claims. Designed for construction companies and fleet managers in Switzerland.

## Current State
- **Phase**: Production Ready
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)

## Key Features
1. **Multilingual Support**: FR, DE, IT, EN with official OFDF terminology
2. **Fleet Management**: Register and manage off-road machines with Taxas categories
3. **Fuel Entry**: Log fuel consumption with invoice tracking
4. **Calculator**: Apply OFDF rate of 0.3405 CHF/L
5. **Reports**: Generate PDF reports for Form 45.35
6. **Taxas Integration**: Bridge between companies and the official OFDF Taxas system

## Technical Architecture

### Frontend Structure
```
client/src/
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn components
│   ├── app-sidebar.tsx
│   ├── i18n-provider.tsx
│   ├── language-selector.tsx
│   └── theme-toggle.tsx
├── hooks/             # Custom React hooks
├── lib/               # Utilities (i18n, queryClient)
└── pages/             # Page components
```

### Backend Structure
```
server/
├── db.ts              # Database connection
├── routes.ts          # API routes
├── storage.ts         # Data access layer
└── replit_integrations/auth/  # Replit Auth
```

### Database Schema
- **users**: User accounts (Replit Auth)
- **sessions**: Session storage
- **machines**: Fleet machines
- **fuel_entries**: Fuel consumption records
- **reports**: Generated reports
- **subscriptions**: Stripe subscriptions

## API Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/trends` - Fuel consumption trends by month (for chart visualization)
- `GET/POST /api/machines` - Machine CRUD
- `GET/POST /api/fuel-entries` - Fuel entry CRUD
- `GET/POST /api/reports` - Report generation
- `GET /api/reports/:id/pdf` - Download PDF
- `GET /api/subscription` - Get subscription status
- `POST /api/checkout` - Create Stripe checkout session
- `GET /api/checkout/success` - Verify payment after redirect
- `POST /api/stripe/webhook` - Stripe webhook handler

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session encryption
- `STRIPE_WEBHOOK_SECRET` - (optional) Stripe webhook signature verification

### Subscription & Trial System
- **10-day free trial** for new users
- **Trial countdown banner** displayed on all pages
- **Export blocking**: PDF/CSV exports blocked after trial expires
- **Subscription status tracking**: trial, trial_expired, active, cancelled, inactive

### Stripe Integration (Implemented)
- Uses Replit Stripe connector for API keys
- Price ID: price_1SoTncAQocW3bCNRDohSEX7u (250 CHF annual subscription)
- Checkout flow: /api/checkout creates session, redirects to /dashboard?session_id=...
- Webhook route registered before express.json() to receive raw Buffer
- Success callback verifies payment and activates subscription

### Email Notifications (TODO)
Email service (Resend) was proposed but user dismissed setup (2026-01-11). To enable email notifications later:
1. Set up Resend connector in Replit OR provide RESEND_API_KEY as a secret
2. Implement email templates for:
   - J-1 trial reminder (24h before trial ends)
   - Quarterly reminders (March, June, Sept, Dec) for subscribers
3. Set up scheduled job system for sending notifications

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes
- `npm run build` - Build for production

## Swiss Tax Authority References
- **OFDF** (FR): Office fédéral de la douane et de la sécurité des frontières
- **BAZG** (DE): Bundesamt für Zoll und Grenzsicherheit
- **AFD** (IT): Amministrazione federale delle dogane
- **FOCBS** (EN): Federal Office for Customs and Border Security
- **Form 45.35**: Official reimbursement request form
- **Taxas**: Official digital platform for consumption tax management

## Taxas Integration (Implemented 2026-01-13)
MineralTax serves as a bridge between companies and the official Taxas system:

### Taxas Activity Categories
Machines can be assigned official Taxas reimbursement categories:
- `agriculture_with_direct` / `agriculture_without_direct`
- `forestry` (Sylviculture)
- `rinsing` (Rinçage)
- `concession_transport` (Transport concessionnaire)
- `natural_stone` (Extraction de pierres naturelles)
- `snow_groomer` (Dameuses)
- `professional_fishing` (Pêche professionnelle)
- `stationary_generator` / `stationary_cleaning` / `stationary_combustion`
- `construction` (Construction / Chantier)

### Taxas-Compatible CSV Export
The CSV export includes:
- Date, invoice number, machine name/type
- Taxas activity code (AGRI_DIRECT, SYLV, CONSTRUCT, etc.)
- Chassis/VIN number
- Volume, fuel type, eligibility, reimbursement calculation

### Taxas Preparation Page
Dedicated `/taxas` page with:
- Step-by-step guide for ePortal registration
- Pre-submission checklist
- Links to official OFDF resources
- Explanation of MineralTax as bridge to Taxas

### Database Schema Updates
- `taxas_activity` enum on `machines` table
- `taxas_status` enum on `reports` table (draft, ready_for_taxas, submitted_to_taxas, approved)
- `taxas_submission_ref` and `taxas_submitted_at` fields on reports

## Reimbursement Rate
- Current rate: **0.3405 CHF per liter**
- Only eligible for off-road machines (not road vehicles)
