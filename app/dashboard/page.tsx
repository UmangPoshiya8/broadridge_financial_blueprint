import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TradeVolumeChart, PieAnalyticsChart } from '@/components/charts/analytics-charts';
import { InvestorAssistant } from '@/components/dashboard/investor-assistant';
import { requireUser } from '@/lib/auth/session';
import { getDashboardMetrics } from '@/services/dashboard';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Dashboard | InvestorConnect Pro' };

export default async function DashboardPage() {
  const user = await requireUser();
  const metrics = await getDashboardMetrics(user);

  const supabase = await createClient();
  const tradesQuery = supabase.from('trades').select('trade_date,quantity').order('trade_date', { ascending: true }).limit(20);
  if (user.role !== 'platform_admin' && user.institution_id) tradesQuery.eq('institution_id', user.institution_id);
  const { data: trades } = await tradesQuery;

  const settlementsQuery = supabase.from('settlements').select('status');
  const { data: settlements } = await settlementsQuery;

  const tradeVolume = (trades ?? []).map((trade) => ({ day: trade.trade_date, volume: trade.quantity }));
  const settlementMap = new Map<string, number>();
  (settlements ?? []).forEach((item) => settlementMap.set(item.status, (settlementMap.get(item.status) ?? 0) + 1));
  const settlementChart = [...settlementMap.entries()].map(([status, value]) => ({ status, value }));

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Shareholders" value={metrics.shareholders} />
        <MetricCard title="Documents Sent" value={metrics.documents} />
        <MetricCard title="Voting Participation" value={metrics.votingParticipation} />
        <MetricCard title="Trades Processed" value={metrics.trades} />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Trade Volume</h3>
          <TradeVolumeChart data={tradeVolume} />
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Settlement Status Analytics</h3>
          <PieAnalyticsChart data={settlementChart} nameKey="status" valueKey="value" />
        </Card>
      </section>
      <InvestorAssistant />
    </AppShell>
  );
}

