# Certa Seguros — QWEN.md

## Project Overview

**Certa Seguros** is a CRM (Customer Relationship Management) application for an insurance brokerage company. It enables insurance brokers to manage clients, prospects, policies, invoices, reminders, and business goals. The application features both a public landing page showcasing insurance services and a secure admin dashboard for internal operations.

### Key Features
- **Client Management**: Unified handling of prospects and active clients with lifecycle tracking (NUEVO → CONTACTADO → EN_PROCESO → ACTIVO)
- **Policy Management**: Track insurance policies (SOAT, vehicular, life, ARL, health, etc.) with status, premiums, and commissions
- **Invoice System**: Electronic invoicing with line items, discounts, tax calculations (19% IVA), and payment status
- **Reminders & Alerts**: Preventive alerts for policy renewals, follow-ups, and visits
- **Business Goals**: Track sales, client acquisition, and revenue goals with milestones
- **Activity Feed**: Dashboard logging of recent system activity
- **Landing Page**: Public-facing site with hero section, insurance services, trust indicators, and contact form

---

## Tech Stack

| Category        | Technology                          |
|-----------------|-------------------------------------|
| Framework       | Next.js 16 (App Router)             |
| Language        | TypeScript                          |
| Styling         | Tailwind CSS v4                     |
| UI Components   | shadcn/ui (base-nova style)         |
| Database        | PostgreSQL (Neon serverless)         |
| ORM             | Prisma 7                            |
| Authentication  | Firebase Auth                       |
| Forms           | React Hook Form + Zod validation    |
| Animations      | Framer Motion                       |
| Charts          | Recharts                            |
| PDF Generation  | @react-pdf/renderer                 |
| Package Manager | pnpm                                |
| Deployment      | Vercel                              |

---

## Project Structure

```
certa-seguros/
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── page.tsx            # Public landing page
│   │   ├── layout.tsx          # Root layout with fonts + AuthProvider
│   │   ├── login/              # Login page
│   │   ├── admin/              # Protected admin dashboard
│   │   │   ├── layout.tsx      # Admin layout wrapper
│   │   │   ├── (dashboard)/    # Dashboard route group
│   │   │   ├── chat/           # Chat feature
│   │   │   └── actions.ts      # Server actions for admin
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── blocks/             # Landing page sections
│   │   └── landing/            # Landing-specific components
│   ├── context/                # React context providers
│   ├── generated/prisma/       # Prisma client output
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── providers/              # App-level providers (auth, etc.)
│   ├── types/                  # TypeScript type definitions
│   └── proxy.ts                # Middleware / proxy logic
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Prisma migration files
├── docs/
│   └── ESTRUCTURA_IMPLEMENTACION.md  # Architecture documentation (Spanish)
├── public/                     # Static assets
├── next.config.ts              # Next.js configuration
├── prisma.config.ts            # Prisma configuration
├── components.json             # shadcn/ui configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Building and Running

### Prerequisites
- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- PostgreSQL database (Neon recommended)
- Firebase project with Auth enabled

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://..."     # Neon DB connection string
FIREBASE_API_KEY="..."              # Firebase config
FIREBASE_AUTH_DOMAIN="..."
FIREBASE_PROJECT_ID="..."
FIREBASE_STORAGE_BUCKET="..."
FIREBASE_MESSAGING_SENDER_ID="..."
FIREBASE_APP_ID="..."
```

### Commands

```bash
# Install dependencies
pnpm install

# Run development server (Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Push schema changes (dev only)
npx prisma db push
```

### URLs
- **Development**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Login**: `http://localhost:3000/login`

---

## Development Conventions

### Package Manager
- **Use pnpm exclusively.** Never use `npm`, `yarn`, or `bun`.

### Architecture Patterns

1. **Server Components by Default**: Pages and data-fetching components should be Server Components unless client-side interactivity is required.
2. **Server Actions for Mutations**: All POST/PUT/DELETE operations use `"use server"` functions with `revalidatePath` for cache invalidation.
3. **Zod Validation**: Every Server Action validates inputs with Zod schemas before database operations.
4. **URL State**: Prefer `searchParams` for table filtering/sorting to enable shareable views and SSR compatibility.
5. **Suspense Boundaries**: Use React `Suspense` for heavy widgets to enable streaming and independent loading.

### Component Guidelines
- shadcn/ui components live in `src/components/ui/` — they are owned code, not black-box dependencies.
- Use semantic Tailwind tokens (`bg-background`, `text-primary`) for theme consistency.
- Form patterns: `FieldGroup` > `Field` > `FieldLabel` for accessibility.

### Type Safety
- Prisma types flow from database → server actions → UI components.
- Path aliases: `@/*` → `./src/*`, `@lib/*` → `./src/lib/*`

### Database
- Financial values use `Decimal(15, 2)` to avoid floating-point precision issues.
- All models have strategic `@@index` annotations on frequently queried fields.
- User authentication is delegated to Firebase Auth; local `User` model stores roles and metadata.

---

## Database Schema Summary

The Prisma schema defines the following core entities:

| Model             | Purpose                                      |
|-------------------|----------------------------------------------|
| `User`            | System users (ADMIN, ASESOR, VIEWER roles)   |
| `Client`          | Unified prospects + active clients            |
| `Service`         | Catalog of offered insurance services         |
| `Policy`          | Issued insurance policies                     |
| `Invoice`         | Electronic invoices with line items           |
| `Reminder`        | Alerts for renewals, follow-ups, visits       |
| `Goal`            | Business goals with milestones                |
| `ActivityLog`     | Dashboard activity feed entries               |
| `ServiceCategory` | Service categories (Movilidad, Salud, etc.)   |
| `ServiceSubcategory` | Service subcategories                     |
| `ClientService`   | Pivot: services interested by each client     |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete database schema with all models, enums, and relations |
| `src/app/layout.tsx` | Root layout with Montserrat + Poppins fonts and AuthProvider |
| `src/app/page.tsx` | Public landing page composition |
| `src/app/admin/layout.tsx` | Admin dashboard layout |
| `components.json` | shadcn/ui configuration and aliases |
| `next.config.ts` | Next.js config including allowed image hosts |
| `docs/ESTRUCTURA_IMPLEMENTACION.md` | Detailed architecture documentation (in Spanish) |
