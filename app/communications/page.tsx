import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { CommunicationCenter } from '@/components/communications/communication-center';

export const metadata: Metadata = { title: 'Communications | InvestorConnect Pro' };

export default async function CommunicationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase.from('communications').select('id,message,type,created_at').order('created_at', { ascending: false });
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data } = await query;

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Investor Communication Center</h1>
      <CommunicationCenter institutionId={user.institution_id ?? ''} items={(data ?? []) as Array<{ id: string; message: string; type: string; created_at: string }>} />
    </AppShell>
  );
}

