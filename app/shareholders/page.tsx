import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { ShareholdersTable } from '@/components/shareholders/shareholders-table';

export const metadata: Metadata = { title: 'Shareholders | InvestorConnect Pro' };

export default async function ShareholdersPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase.from('shareholders').select('id,name,email,ownership_percent').order('name');
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data } = await query;

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Shareholder Registry</h1>
      <ShareholdersTable items={(data ?? []) as Array<{ id: string; name: string; email: string; ownership_percent: number }>} institutionId={user.institution_id ?? ''} />
    </AppShell>
  );
}

