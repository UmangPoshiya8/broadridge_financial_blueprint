# CHANGELOG

## 2026-03-14
- Initialized documentation files for InvestorConnect Pro scaffold.
- Added complete Next.js App Router SaaS project scaffold with role-based auth UX.
- Implemented protected dashboard modules: shareholders, securities, trades, settlements, voting, vote, documents, communications, and admin.
- Added API routes with session checks and Zod validation for shareholders, meetings/proposals/votes, documents, communications, admin user creation, and AI assistant.
- Implemented Investor Assistant using OpenAI with automatic mock fallback when API key is unavailable.
- Added Supabase migration with full schema, storage buckets, auth trigger, indexes, and tenant-aware RLS policies.
- Added seed script for institution, users, shareholders, securities, trades, settlements, meeting/proposals/votes, documents, communications, notifications, and audit logs.
- Added test setup (Vitest + Playwright), unit tests, and deployment-ready README.
