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

## Using Specialized Agents

This project has access to specialized AI agents that autonomously handle complex, multi-step tasks. These agents are designed to work proactively - they will be invoked automatically when tasks match their capabilities.

### Available Agents

| Agent | When It's Used | What It Does |
|-------|----------------|--------------|
| **code-reviewer** | After completing major features, numbered plan steps, or logical code chunks | Reviews implementations against plans and coding standards, identifies issues |
| **shadcn-builder-expert** | When working with Shadcn Builder codebase, form components, drag-and-drop, Zustand store | Implements features, manages components, generates code, handles templates |
| **ui-designer** | Creating design systems, component libraries, visual hierarchies, accessibility-compliant interfaces | Creates comprehensive design systems, component specs, responsive layouts, developer handoff docs |
| **ux-architect** | Establishing technical foundations before implementation begins | Creates CSS design systems, layout frameworks, component architectures, responsive strategies |
| **ux-researcher** | When design decisions need user evidence, before major launches, analyzing user behavior | User behavior analysis, usability testing, persona creation, journey mapping, data-driven recommendations |
| **general-purpose** | Complex multi-step tasks not covered by specialized agents | Research, code searching, feature implementation |
| **Explore** | Quick codebase exploration and file searching | Fast pattern matching, keyword searches, answering codebase questions |

### Agent Usage Patterns

**Proactive Invocation Examples:**

1. **Feature Implementation Workflow:**
   ```
   User: "Implement a new client management table with filtering"
   → I'll use shadcn-builder-expert to implement the UI
   → After completion, I'll use code-reviewer to validate
   ```

2. **Design System Setup:**
   ```
   User: "Set up a consistent design system for our dashboard"
   → I'll use ui-designer to create comprehensive specifications
   → I'll use ux-architect to establish technical foundation
   ```

3. **Code Review After Major Changes:**
   ```
   User: "I've finished implementing the authentication system (Step 3)"
   → I'll use code-reviewer to validate against the plan
   ```

4. **UX Validation Needed:**
   ```
   User: "Should we prioritize this feature? Users are complaining about navigation"
   → I'll use ux-researcher to analyze and provide data-driven recommendations
   ```

### When to Expect Agent Usage

I will automatically use agents when:
- Starting complex feature implementations
- Completing significant project milestones
- Designing new UI components or systems
- Establishing technical architecture
- Making decisions that need user research validation
- Exploring large codebases for patterns

### Agent Thoroughness Levels

For the **Explore** agent, you can specify thoroughness:
- **quick**: Basic searches, finding specific files
- **medium**: Moderate exploration of related files
- **very thorough**: Comprehensive analysis across multiple locations

### Best Practices

1. **Let agents work autonomously**: Once invoked, agents handle tasks without manual intervention
2. **Trust the review process**: code-reviewer validates work against plans and standards
3. **Use for complex tasks**: Agents shine on multi-step tasks that require specialized knowledge
4. **Provide context**: Clear requirements help agents deliver better results

---

## Using Skills

Skills are specialized capabilities that provide domain-specific knowledge and workflows. They are invoked using the `skill` command and provide focused expertise for particular tasks.

### Mandatory Skills Usage

**This project requires the following skills to be used obligatorily:**

#### 1. `using-superpowers` (MANDATORY - Use First)
- **When**: **ALWAYS invoke at the start of ANY conversation** before any other action
- **Purpose**: Establishes how to find and use skills, sets up the workflow foundation
- **Command**: `skill: "using-superpowers"`
- **Critical Rule**: Must be called BEFORE any response, including clarifying questions
- **Why**: Configures the skill discovery and usage framework for the entire session

#### 2. `shadcn` (MANDATORY for UI Work)
- **When**: ANY task involving shadcn/ui components, UI creation, styling, or component registry
- **Purpose**: Manages shadcn components, projects, presets, fixes, debugging, and composition
- **Command**: `skill: "shadcn"`
- **Triggers**: 
  - Adding/modifying UI components
  - Running `shadcn init` or `shadcn add`
  - Working with `--preset` codes
  - Any project with a `components.json` file (which this project has)
- **Why**: This project uses shadcn/ui as its primary UI component system

### Additional Available Skills

| Skill | When to Use | Command |
|-------|-------------|---------|
| **tailwind-design-system** | Building component libraries, implementing design systems with Tailwind CSS v4 | `skill: "tailwind-design-system"` |
| **ui-ux-pro-max** | UI/UX design intelligence, 50+ styles, 161 color palettes, accessibility, responsive design | `skill: "ui-ux-pro-max"` |
| **next-best-practices** | Writing/reviewing React/Next.js code, performance optimization, data fetching patterns | `skill: "next-best-practices"` |
| **vercel-react-best-practices** | React/Next.js performance optimization, bundle size, data fetching | `skill: "vercel-react-best-practices"` |
| **nextjs-framer-motion-animations** | Adding Motion/Framer Motion animations in Next.js apps | `skill: "nextjs-framer-motion-animations"` |
| **review** | Reviewing changed code for correctness, security, quality, performance | `skill: "review"` or `/review` |
| **loop** | Creating recurring prompt loops on schedules | `/loop 5m check the build` |
| **qc-helper** | Qwen Code usage questions, configuration, troubleshooting | `/qc-helper` |
| **firebase-auth-basics** | Setting up Firebase Authentication | `skill: "firebase-auth-basics"` |
| **openrouter-typescript-sdk** | Integrating with AI models through OpenRouter SDK | `skill: "openrouter-typescript-sdk"` |
| **find-skills** | Discovering and installing new agent skills | `skill: "find-skills"` |

### Skill Usage Workflow

**Mandatory Sequence for Any Task:**

1. **ALWAYS start with superpowers:**
   ```
   skill: "using-superpowers"
   ```

2. **Then use shadcn for any UI work:**
   ```
   skill: "shadcn"
   ```

3. **Then use other skills as needed:**
   ```
   skill: "tailwind-design-system"
   skill: "ui-ux-pro-max"
   ```

### Examples

**Example 1: Creating a New UI Component**
```
User: "Create a client data table with sorting"
→ Step 1: skill: "using-superpowers" (MANDATORY FIRST)
→ Step 2: skill: "shadcn" (MANDATORY for UI)
→ Step 3: skill: "tailwind-design-system" (for styling patterns)
→ Step 4: Implement the component
→ Step 5: skill: "review" (validate the code)
```

**Example 2: Building a Landing Page Section**
```
User: "Add a testimonials section to the landing page"
→ Step 1: skill: "using-superpowers" (MANDATORY FIRST)
→ Step 2: skill: "shadcn" (MANDATORY for UI)
→ Step 3: skill: "ui-ux-pro-max" (for design guidance)
→ Step 4: Build the section
```

**Example 3: Performance Optimization**
```
User: "Optimize the dashboard loading speed"
→ Step 1: skill: "using-superpowers" (MANDATORY FIRST)
→ Step 2: skill: "next-best-practices" (for Next.js patterns)
→ Step 3: skill: "vercel-react-best-practices" (for React optimization)
→ Step 4: Apply optimizations
```

### Critical Rules

1. **NEVER skip `using-superpowers`** - It must ALWAYS be the first skill invoked
2. **ALWAYS use `shadcn` for UI tasks** - This project's UI system is shadcn/ui
3. **Invoke skills IMMEDIATELY** - Don't announce or mention skills without calling them
4. **Skills are blocking requirements** - Must be invoked before generating responses about tasks
5. **Resolve absolute paths from skill's base directory** when executing scripts or loading referenced files

### Skill Configuration

Skills are configured in:
- `skills-lock.json` - Project-level skill configuration
- Bundled skills in the system - Always available
- User-installed skills - Available via `find-skills`

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
