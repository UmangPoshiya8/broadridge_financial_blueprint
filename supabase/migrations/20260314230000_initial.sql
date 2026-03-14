-- Ensure extension exists
create extension if not exists "pgcrypto";

-- 1. Ensure institutions.name is unique (needed for ON CONFLICT)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'institutions_unique_name'
  ) then
    alter table public.institutions
    add constraint institutions_unique_name unique (name);
  end if;
end
$$;

-- 2. Ensure users.email unique index exists
create unique index if not exists users_unique_email
on public.users (email);

-- 3. Ensure securities unique constraints exist
create unique index if not exists securities_unique_ticker
on public.securities (ticker);

-- 4. Ensure shareholders email uniqueness per institution
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shareholders_unique_email_per_institution'
  ) then
    alter table public.shareholders
    add constraint shareholders_unique_email_per_institution
    unique (email, institution_id);
  end if;
end
$$;

-- 5. Ensure meetings unique title per institution
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meetings_unique_title_per_institution'
  ) then
    alter table public.meetings
    add constraint meetings_unique_title_per_institution
    unique (institution_id, title);
  end if;
end
$$;

-- 6. Ensure votes unique per shareholder/proposal
create unique index if not exists votes_unique_shareholder_proposal
on public.votes (shareholder_id, proposal_id);

-- 7. Ensure documents unique title per institution
create unique index if not exists documents_unique_title_institution
on public.documents (title, institution_id);

-- 8. Ensure positions unique constraint
create unique index if not exists positions_unique_shareholder_security
on public.positions (shareholder_id, security_id);

-- 9. Ensure settlements unique trade_id
create unique index if not exists settlements_unique_trade
on public.settlements (trade_id);

-- 10. Ensure storage buckets exist (non-destructive)
insert into storage.buckets (id, name, public)
values
  ('investor-documents','investor-documents',true),
  ('proxy-materials','proxy-materials',true),
  ('reports','reports',true)
on conflict (id) do nothing;