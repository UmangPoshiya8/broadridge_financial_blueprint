# SCHEMA

## Migration
- `supabase/migrations/20260314230000_initial.sql`

## Tables
- `institutions`
- `users`
- `shareholders`
- `securities`
- `positions`
- `meetings`
- `proposals`
- `votes`
- `documents`
- `communications`
- `trades`
- `settlements`
- `notifications`
- `audit_logs`

## Key Constraints
- Role check enforced in `users.role`
- Vote enum check in `votes.vote` (`yes|no|abstain`)
- Settlement status check in `settlements.status` (`pending|completed|failed`)
- Communication type check in `communications.type`
- Unique constraints:
  - `shareholders(email, institution_id)`
  - `securities(ticker, institution_id)`
  - `meetings(institution_id, title)`
  - `documents(title, institution_id)`
  - `votes(shareholder_id, proposal_id)`
  - `positions(shareholder_id, security_id)`
  - `settlements(trade_id)`

## Storage Buckets
- `investor-documents`
- `proxy-materials`
- `reports`

## Auth + RLS
- Trigger `on_auth_user_created` calls `handle_new_user()` to sync auth users into `public.users`.
- Investor self-registration is constrained via trigger role normalization.
- Platform admin cross-institution access via `is_platform_admin()` helper.
- Institution-scoped access via `current_institution_id()` helper.
- RLS enabled on all application tables and storage object policies applied for institution-prefixed file paths.
