# BARBERIN — Agent Guidelines

## Security & Secrets
- Never expose, print, log, or hardcode any database credentials, passwords, private keys, or API tokens in source code or Git commits.
- `DATABASE_URL` must strictly remain server-side and retrieved through environment variables only (`process.env["DATABASE_URL"]`).
- Keep `.env` and sensitive files untracked by Git at all times.

## Architecture & Conventions
- **Framework**: TanStack Start with TanStack Router, React 19, and Vite.
- **Styling**: Tailwind CSS v4 with Radix UI and Lucide React icons.
- **ORM & Database**: Drizzle ORM connected to Supabase PostgreSQL (transaction pooler port 6543).
- **Routing**: File-based routing in `src/routes/`. Do not create non-standard directories like `pages/` or `app/`.
- **Server Functions**: All database mutations and queries from the frontend should go through `@tanstack/react-start` server functions (`createServerFn`) located in `src/lib/`.
- Keep the main branch in a working, verifiable state with clean commits.
