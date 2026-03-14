# InvestorConnect Pro

InvestorConnect Pro is a production-oriented SaaS platform for shareholder management, proxy voting, investor communications, and simplified trade/settlement tracking.

## Stack
- Next.js 15 (App Router) + TypeScript
- TailwindCSS
- Supabase (Auth, Postgres, Storage, RLS)
- Recharts
- Zod + React Hook Form foundations
- OpenAI (with mock fallback mode)

## Features
- Role-based auth (`platform_admin`, `institution_admin`, `compliance_officer`, `investor`)
- Tenant isolation with Supabase Row Level Security
- Shareholder registry CRUD + search/filter UI
- Proxy meetings, proposals, voting, and results charts
- Document delivery portal using Supabase Storage buckets:
  - `investor-documents`
  - `proxy-materials`
  - `reports`
- In-app communications + notifications
- Trades and settlements dashboards
- Investor Assistant API (`/api/ai/investor-assistant`)

## Project Structure
- `app/` Next.js pages + API routes
- `components/` UI and feature components
- `lib/` Supabase/auth/validation helpers
- `services/` dashboard and integration services
- `supabase/migrations/` SQL schema + RLS
- `scripts/seed.ts` demo seed pipeline
- `doc/` project operating documents

## Environment Setup
Copy `.env.example` to `.env.local` and set values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If `OPENAI_API_KEY` is missing, Investor Assistant automatically runs in mock mode.

## Local Setup
```bash
pnpm install
pnpm dev
```

### Supabase Setup
1. Create a Supabase project.
2. Run migration from `supabase/migrations/20260314230000_initial.sql`.
3. Ensure email confirmation behavior in Supabase Auth matches your environment needs.
4. Run seed:

```bash
pnpm seed
```

## Demo Credentials
- Platform Admin: `umang.poshiya@bacancy.com` / `Demo@123`
- Institution Admin: `umang.poshiyaia@mailinator.com` / `Demo@123`
- Compliance Officer: `umang.poshiyaco@mailinator.com` / `Demo@123`
- Investor: `umang.poshiyais1@mailinator.com` / `Demo@123`
- Investor: `umang.poshiyais2@mailinator.com` / `Demo@123`

## Security Notes
- Investor self-signup is restricted to `investor` role.
- Non-investor roles are designed to be created by Platform Admin flows using privileged context.
- Every data table is RLS-protected with institution isolation and platform-admin override.
- Storage object paths are institution-scoped (`<institution_id>/file`).

## Tests
```bash
pnpm test
pnpm test:e2e
```

## Vercel Deployment
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add required environment variables in Vercel project settings.
4. Ensure Supabase URL/keys point to production project.
5. Deploy.

### Recommended Build Commands
- Install: `pnpm install`
- Build: `pnpm build`
- Output: Next.js default

## Future Extensions
- Add Resend/SendGrid provider implementation in `services/email.ts`.
- Expand admin UI for creating institution admins/compliance officers through auth admin APIs.
- Add queue-based notification fanout and audit dashboards.
