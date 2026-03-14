import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { VotingResultsChart } from '@/components/charts/analytics-charts';
import { MeetingManager } from '@/components/voting/meeting-manager';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getVoteResultsByProposal } from '@/services/dashboard';

export const metadata: Metadata = { title: 'Voting | InvestorConnect Pro' };

export default async function VotingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const query = supabase.from('meetings').select('id,title,meeting_date').order('meeting_date', { ascending: false });
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data: meetings } = await query;

  const topMeeting = meetings?.[0];
  const chartData = topMeeting ? await getVoteResultsByProposal(topMeeting.id) : [];

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Proxy Voting</h1>
      <MeetingManager institutionId={user.institution_id ?? ''} meetings={(meetings ?? []) as Array<{ id: string; title: string; meeting_date: string }>} />
      <Card>
        <h3 className="mb-2 text-lg font-semibold">Voting Results</h3>
        <VotingResultsChart data={chartData} />
      </Card>
    </AppShell>
  );
}

