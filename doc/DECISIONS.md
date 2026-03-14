# DECISIONS

## 2026-03-14
- Chose Next.js App Router + Supabase SSR auth for secure multi-tenant SaaS baseline.
- Enforced tenant isolation in RLS using helper functions `is_platform_admin()` and `current_institution_id()` for consistent policy logic across all tables.
- Implemented investor self-signup safety through auth trigger role normalization (non-investor roles require admin-created auth metadata).
- Used Supabase Storage path convention `<institution_id>/<file>` to align bucket object access with tenant-scoped policies.
- Added OpenAI integration with deterministic local fallback mode to keep demo environments functional without external API keys.
- Kept communication delivery in-app only for MVP and introduced `services/email.ts` provider interface for later Resend/SendGrid expansion.
