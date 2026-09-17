# BARBERIN

BARBERIN is a modern barbershop management and customer service web application designed to simplify the process of selecting services, managing transactions, handling payments, and providing digital receipts.

---

## Overview

BARBERIN bridges the gap between barbershop customers, staff (capsters), and shop owners. For customers, it offers an intuitive mobile-first experience to discover grooming services, select preferred barbers, check out seamlessly with multiple payment methods, track service status in real time, and download verified digital receipts.

For barbershop operations, BARBERIN provides a dedicated Point of Sale (POS) and cashier system for capsters to log walk-in customers and manage active shifts, alongside a comprehensive Owner and Superadmin administration suite for real-time revenue analytics, staff commission tracking, automated payroll calculations, and auditable operational logs.

---

## Main Features

### Customer Experience
* **Service Catalogue & Selection**: Dynamic browsable catalog of grooming services (haircuts, styling, treatments, shaving) with duration and pricing details.
* **Shopping Cart & Checkout**: Real-time service cart with subtotal calculation and dynamic item management.
* **Customer Identification**: Automated unique customer ID generation with customer contact and detail capture.
* **Barber (Capster) Selection**: Ability to choose available capsters or assign automatically.
* **Multi-Method Payment Selection**: Support for Cash (Tunai), QRIS, and Bank Transfer with transaction reference management.
* **Payment Confirmation & Processing**: Dedicated review screen before final order placement and status confirmation.
* **Service Execution Tracking**: Real-time service countdown timer and live progress status (`waiting`, `in_progress`, `completed`).
* **Digital & PDF Receipt**: Instant digital receipt view with downloadable, formatted PDF receipt generated client-side via jsPDF.
* **Customer Transaction History**: Searchable and filterable history of past bookings and receipts.

### Capster (Barber) Operations
* **Role-Based Authentication**: Secure capster login and session state management.
* **Shift Management**: Shift check-in and end-shift attendance tracking with timestamped records.
* **Capster Dashboard**: Overview of daily metrics, active queue, total services rendered, and accrued tips/commissions.
* **Manual Cashier POS**: Dedicated workflow for logging offline/walk-in customers directly into the barbershop system.
* **Transaction History**: Real-time daily log of processed orders and service executions.

### Owner Administration & Business Intelligence
* **Executive Dashboard**: Key performance indicator (KPI) metric cards (Total Revenue, Transaction Volume, Active Capsters, Average Order Value) with revenue charts.
* **Service Management (CRUD)**: Create, edit, activate, or suspend services, adjust durations, and update pricing tiers.
* **Staff Management**: Barber profiles, status toggling, and assignment configurations.
* **Commission & Payroll (Gaji)**: Automated salary calculations, tiered commission distribution per service, and exportable payroll reports.
* **Audit Logs**: Deep inspection of activity logs and financial records with granular event tracking.
* **Shop Settings**: Configurable operating hours (open/close times), store contact info, and profile security management.

### Superadmin Multi-Tenancy
* **Multi-Tenant SaaS Management**: Centralized management across barbershop branches and tenant onboarding.
* **Superadmin Authentication**: Protected platform administrator login and store overview.

### Automation & Background Workflows
* **Automated Order Expiration**: Built-in 2-hour auto-cancellation mechanism for unpaid or abandoned pending transactions.

---

## User Flow

### Customer Booking & Payment Flow
```
Customer accesses BARBERIN
       │
       ▼
Selects Services & Adds to Cart
       │
       ▼
Reviews Cart & Enters Customer Info (Auto ID Assigned)
       │
       ▼
Selects Preferred Capster
       │
       ▼
Chooses Payment Method (Cash / QRIS / Transfer)
       │
       ▼
Reviews Order & Confirms Payment
       │
       ▼
Transaction Completed Successfully
       │
       ▼
Monitors Live Service Execution
       │
       ▼
Views Digital Receipt / Downloads PDF Receipt
```

### Walk-in POS Flow (Capster Cashier)
```
Capster Logs In & Checks In to Active Shift
       │
       ▼
Selects "Transaksi Manual" (POS)
       │
       ▼
Selects Services requested by walk-in customer
       │
       ▼
Enters Customer Name and Notes
       │
       ▼
Collects Payment (Tunai / QRIS / Transfer)
       │
       ▼
System creates confirmed transaction & prints/generates receipt
       │
       ▼
Service execution recorded under Capster's daily shift
```

---

## Technology Stack

* **Frontend Framework**: [React 19](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (ES2022)
* **Application Framework & SSR**: [TanStack Start](https://tanstack.com/start/latest)
* **Client & Server Routing**: [TanStack Router](https://tanstack.com/router/latest) (File-based routing)
* **Server State & Querying**: [TanStack React Query](https://tanstack.com/query/latest)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
* **UI Components & Icons**: [Radix UI](https://www.radix-ui.com/) Primitives & [Lucide React](https://lucide.dev/)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) hosted on [Supabase](https://supabase.com/) with [Drizzle ORM](https://orm.drizzle.team/) & [postgres.js](https://github.com/porsager/postgres)
* **Build Tool & Server Engine**: [Vite 8](https://vitejs.dev/) with [Nitro](https://nitro.unjs.io/) server integration
* **Document & PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
* **Data Visualization**: [Recharts](https://recharts.org/)

---

## Project Structure

```text
├── drizzle/                    # Drizzle migrations, SQL schema definitions, and seed scripts
├── public/                     # Static assets (logos, favicon, robots.txt)
├── scripts/                    # Database migration, verification, and utility scripts
├── src/
│   ├── assets/                 # Application images and media
│   ├── components/             # Reusable UI component library
│   │   ├── barberin/           # Customer flow components (cart, receipts, service cards)
│   │   ├── capster/            # Capster portal and POS cashier components
│   │   ├── owner/              # Owner dashboard, commission tables, and settings modals
│   │   ├── superadmin/         # Platform administration and tenant management components
│   │   └── ui/                 # Core design system primitives (Radix UI / Shadcn)
│   ├── db/                     # Drizzle ORM database instance and schema definitions
│   │   ├── index.ts            # Server-side PostgreSQL connection pooler configuration
│   │   └── schema.ts           # Complete database relational schema (11 ERD tables)
│   ├── hooks/                  # Custom React application hooks
│   ├── lib/                    # Server functions (createServerFn), stores, and business logic
│   │   ├── bookings.ts         # Customer booking and order processing server functions
│   │   ├── services.ts         # Service catalogue querying and mutation server functions
│   │   ├── capsters.ts         # Capster assignments and active shift server functions
│   │   ├── owner.ts            # Owner analytics, financial audits, and payroll server functions
│   │   ├── superadmin.ts       # Platform tenant management server functions
│   │   ├── auto-cancel.ts      # Automated unpaid order cleanup logic
│   │   └── format.ts           # Indonesian currency (IDR) and WIB timezone date-time formatters
│   ├── routes/                 # File-based route definitions (TanStack Router)
│   │   ├── __root.tsx          # Root application shell, providers, and error boundaries
│   │   ├── index.tsx           # Entry redirect route
│   │   ├── customer.*.tsx      # Customer booking, payment, and receipt routes
│   │   ├── capster.*.tsx       # Capster login, POS, shift, and dashboard routes
│   │   ├── owner.*.tsx         # Owner login, analytics, services, and payroll routes
│   │   └── superadmin.*.tsx    # Superadmin tenant portal routes
│   ├── router.tsx              # Router initialization and context configuration
│   ├── server.ts               # SSR entrypoint and server error normalization
│   ├── start.ts                # TanStack Start server configuration and CSRF protection
│   └── styles.css              # Global styles, typography, and Tailwind CSS v4 variables
├── .env.example                # Template for required environment variables
├── components.json             # Shadcn component configuration
├── drizzle.config.ts           # Drizzle Kit migration configuration
├── eslint.config.js            # ESLint code style and quality rules
├── package.json                # Project dependencies and script declarations
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite build and plugin configuration
```

---

## Database

The database architecture consists of a relational PostgreSQL schema managed through Drizzle ORM. The core domain models encompass:

* `barbershop`: Store identity, address, contact numbers, and operating hours.
* `users`: Authentication records with role differentiation (`superadmin`, `owner`, `capster`, `customer`).
* `capster`: Professional barber records, profile images, and operational status.
* `shift_capster`: Daily attendance logging, clock-in/out timestamps, and shift notes.
* `layanan`: Service catalog entries, duration in minutes, and pricing.
* `pelanggan`: Customer records linked with unique generated identifiers.
* `booking`: Master reservation records with booking codes and overall status.
* `detail_booking`: Line items linking bookings to selected services and assigned capsters.
* `transaksi`: Financial transaction records capturing total amounts and status (`pending`, `paid`, `cancelled`).
* `pembayaran`: Payment method details, verification timestamps, and reference codes.
* `struk`: Generated digital receipt numbers and metadata.

> Database connections use the Supabase Transaction Pooler (port `6543`) to support high-concurrency serverless execution without connection exhaustion.

---

## Environment Variables

All database credentials and runtime configurations are loaded via environment variables and must never be committed to source control.

To configure local development, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your connection string in `.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

* `DATABASE_URL`: Full PostgreSQL connection string targeting Supabase Transaction Pooler (port `6543`).

---

## Development

Install the project dependencies:

```bash
npm install
```

Start the local Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

Additional development commands:

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint validation
npm run lint

# Format codebase with Prettier
npm run format

# Push schema changes to database (Drizzle Kit)
npm run db:push

# Seed database with initial sample data
npm run db:seed
```

---

## Production / Deployment

BARBERIN is configured with [Nitro](https://nitro.unjs.io/) to produce universal serverless output suitable for deployment on hosting platforms like **Vercel**, **Cloudflare Pages**, or **Node.js**:

```bash
npm run build
```

The build outputs:
* `.output/server/`: Serverless SSR entry points and server functions.
* `.output/public/`: Static client assets, fonts, and client scripts.

### Deployment Environment Configuration
Ensure that `DATABASE_URL` is set in your hosting platform's environment settings (e.g., Vercel Project Settings → Environment Variables). Never hardcode database credentials in configuration files.

---

## Security Notes

* **Zero Hardcoded Secrets**: All database connection URLs and credentials are read strictly from `process.env["DATABASE_URL"]`. The application will throw a runtime error if unconfigured.
* **Server-Only Execution**: Database connections and Drizzle queries are executed strictly server-side through `@tanstack/react-start` server functions (`createServerFn`). Database connection credentials are never exposed to client-side bundles or `VITE_*` public variables.
* **Protected Environment Files**: All `.env` and `.env.*` files are untracked and excluded in `.gitignore`. Only sanitized template files (`.env.example`) are versioned.
* **CSRF Protection**: Integrated cross-site request forgery middleware in `src/start.ts` validates incoming server function requests.

---

## Status

**Current Milestone**: Fully Functional Barbershop Management Web Application.
* Full customer checkout, live status tracking, and PDF receipt workflows are operational.
* Complete Capster POS cashier and shift attendance features are implemented.
* Comprehensive Owner analytics, service CRUD, and payroll calculations are integrated.
* Superadmin multi-tenant management module is active.
