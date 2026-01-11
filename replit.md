# MineralTax Swiss - Swiss Mineral Oil Tax Reimbursement SaaS

## Overview
Professional SaaS application for Swiss mineral oil tax (Mineralölsteuer) reimbursement claims. Designed for construction companies and fleet managers in Switzerland.

## Current State
- **Phase**: MVP Development
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)

## Key Features
1. **Multilingual Support**: FR, DE, IT, EN with official OFDF terminology
2. **Fleet Management**: Register and manage off-road machines
3. **Fuel Entry**: Log fuel consumption with invoice tracking
4. **Calculator**: Apply OFDF rate of 0.3405 CHF/L
5. **Reports**: Generate PDF reports for Form 45.35

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
- `GET/POST /api/machines` - Machine CRUD
- `GET/POST /api/fuel-entries` - Fuel entry CRUD
- `GET/POST /api/reports` - Report generation
- `GET /api/reports/:id/pdf` - Download PDF

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session encryption
- `STRIPE_SECRET_KEY` - (TODO) Stripe integration

### Stripe Integration Note
Stripe integration was proposed but not configured. To enable payments:
1. Set up Stripe connector in Replit
2. Configure 250 CHF annual subscription product
3. Implement checkout and webhook endpoints

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
- **Taxas**: Official submission application

## Reimbursement Rate
- Current rate: **0.3405 CHF per liter**
- Only eligible for off-road machines (not road vehicles)
