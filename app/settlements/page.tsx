import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { PieAnalyticsChart } from '@/components/charts/analytics-charts';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Settlements | InvestorConnect Pro' };

export default async function SettlementsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase.from('settlements').select('id,settlement_date,status,trades!inner(id,institution_id,quantity,price)');
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('trades.institution_id', user.institution_id);
  const { data } = await query;

  const statusMap = new Map<string, number>();
  (data ?? []).forEach((row) => statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1));
  const chartData = [...statusMap.entries()].map(([status, value]) => ({ status, value }));

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Settlements</h1>
      <Card>
        <h3 className="mb-2 text-lg font-semibold">Settlement Status Analytics</h3>
        <PieAnalyticsChart data={chartData} nameKey="status" valueKey="value" />
      </Card>
      <Card>
        <Table>
          <TableHead><TableRow><TableCell>Settlement Date</TableCell><TableCell>Status</TableCell><TableCell>Trade Value</TableCell></TableRow></TableHead>
          <TableBody>
            {(data ?? []).map((row) => (
              (() => {
                const trade = Array.isArray(row.trades)
                  ? (row.trades[0] as { quantity?: number; price?: number } | undefined)
                  : (row.trades as { quantity?: number; price?: number } | null);

                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.settlement_date}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{Number(trade?.quantity ?? 0) * Number(trade?.price ?? 0)}</TableCell>
                  </TableRow>
                );
              })()
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}

