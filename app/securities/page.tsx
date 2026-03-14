import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Securities | InvestorConnect Pro' };

export default async function SecuritiesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const query = supabase.from('securities').select('id,name,ticker').order('name');
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data } = await query;

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Securities</h1>
      <Card>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Ticker</TableCell></TableRow></TableHead>
          <TableBody>
            {(data ?? []).map((item) => (
              <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.ticker}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}

