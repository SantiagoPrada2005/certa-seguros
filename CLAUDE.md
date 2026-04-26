# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: This is NOT the Next.js you know

This project uses Next.js 16 which has breaking changes vs. the Next.js you were trained on. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code. Heed all deprecation notices.

## Package Manager

Use **pnpm** exclusively. Never run `npm`, `yarn`, or `bun` commands.

## Commands

```bash
pnpm dev          # Development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
npx prisma generate    # Regenerate Prisma client (output: src/generated/prisma/)
npx prisma migrate dev  # Run pending migrations
npx prisma db push      # Push schema directly (dev only, bypasses migrations)
```

No test suite is configured yet.

## Architecture

**Certa Seguros** is an insurance brokerage CRM with a public landing page and an authenticated admin dashboard.

### Route Structure

```
/                        Public landing page (server component)
/login                   Firebase Auth login
/admin                   Protected admin shell (AdminSidebar + theme)
/admin/(dashboard)/      Dashboard home with stats/activity feed
/admin/(dashboard)/clientes/     Client management (CRUD, 360° view)
/admin/(dashboard)/prospectos/   Prospect pipeline (table + kanban)
/admin/(dashboard)/polizas/      Policy management
/admin/(dashboard)/facturas/     Invoice management with PDF generation
/admin/(dashboard)/servicios/    Service catalog (categories/subcategories/services)
/admin/(dashboard)/metas/        Business goals with milestones
/admin/(dashboard)/recordatorios/ Reminders and alerts
/admin/chat/             AI chat (OpenRouter-powered)
```

API routes live under `/api/` — one folder per entity, each with `route.ts` exporting `GET` and `POST` handlers, plus `[id]/route.ts` for single-resource operations.

### Auth Flow

1. Firebase Auth handles identity (client side via `src/lib/firebase/config.ts`).
2. `AuthProvider` (root layout) listens to `onAuthStateChanged`, gets the ID token, and calls the `createSession` server action.
3. `createSession` (`src/app/login/actions.ts`) verifies the token with Firebase Admin, upserts the user in the local `User` table (default role: `VIEWER`), and sets a `firebase_session` cookie.
4. `proxy.ts` (middleware matcher: `/admin/:path*`, `/login`) reads the cookie — redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/admin`. It also sets security headers.

### Data Access Patterns

- **Server Components** query Prisma directly (import from `@/lib/prisma`). No `fetch` wrappers needed.
- **Client Components** use the typed helpers in `src/lib/api-client.ts` (`fetchClients`, `fetchProspects`, etc.) which call the REST API at `NEXT_PUBLIC_APP_URL`. Set `cache: "no-store"` on these fetches.
- **Mutations** use Server Actions (`"use server"` in `actions.ts` files) with Zod validation before touching the DB. After mutating, call `revalidatePath()` to bust the Next.js cache.
- **URL state**: table filters/sorting use `searchParams` so views are shareable and SSR-compatible.

### Database (Prisma + Neon serverless PostgreSQL)

- Prisma adapter: `@prisma/adapter-neon` (serverless-friendly connection pooling).
- All financial fields use `Decimal(15, 2)` — never `Float`.
- Client and Prospect are separate models (not unified). `Client` has `ACTIVO|INACTIVO|MOROSO` status; `Prospect` has `NUEVO|CONTACTADO|EN_PROCESO|DESCARTADO|CONVERTIDO` status.
- `Prospect` supports soft delete (`deletedAt` field) — filter it out in queries.
- The generated Prisma client lives at `src/generated/prisma/` (custom output path).

### UI Components

- shadcn/ui with `base-nova` style, `neutral` base color, CSS variables theming, lucide icons.
- All shadcn primitives are **owned code** in `src/components/ui/` — modify them directly.
- Use semantic Tailwind tokens (`bg-background`, `text-primary`, `border-border`) for theme consistency.
- Complex form patterns use `FieldGroup` > `Field` > `FieldLabel` from `@base-ui/react`.

### Path Aliases

```json
"@/*"   → "./src/*"
"@lib/*" → "./src/lib/*"
```

### Key Libraries

| Concern | Library |
|---------|---------|
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` |
| Animations | `framer-motion` |
| Charts | `recharts` |
| PDF generation | `@react-pdf/renderer` |
| AI chat | `@openrouter/sdk` |
| Date handling | `date-fns` |
| Toasts | `sonner` |