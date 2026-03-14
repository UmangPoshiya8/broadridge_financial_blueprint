import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { TradeVolumeChart } from '@/components/charts/analytics-charts';

export const metadata: Metadata = { title: 'Trades | InvestorConnect Pro' };

export default async function TradesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase
    .from('trades')
    .select('id,quantity,price,trade_date,securities(name,ticker)')
    .order('trade_date', { ascending: false });
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data } = await query;

  const chartData = (data ?? []).slice(0, 10).map((item) => ({ day: item.trade_date, volume: item.quantity }));

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Trades</h1>
      <Card>
        <h3 className="mb-2 text-lg font-semibold">Trade Volume</h3>
        <TradeVolumeChart data={chartData} />
      </Card>
      <Card>
        <Table>
          <TableHead><TableRow><TableCell>Security</TableCell><TableCell>Trade Date</TableCell><TableCell>Quantity</TableCell><TableCell>Price</TableCell></TableRow></TableHead>
          <TableBody>
            {(data ?? []).map((trade) => (
              (() => {
                const security = Array.isArray(trade.securities)
                  ? (trade.securities[0] as { ticker?: string } | undefined)
                  : (trade.securities as { ticker?: string } | null);

                return (
                  <TableRow key={trade.id}>
                    <TableCell>{security?.ticker ?? 'N/A'}</TableCell>
                    <TableCell>{trade.trade_date}</TableCell>
                    <TableCell>{trade.quantity}</TableCell>
                    <TableCell>{trade.price}</TableCell>
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

