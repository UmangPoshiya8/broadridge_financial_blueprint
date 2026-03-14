import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin | InvestorConnect Pro' };

export default async function AdminPage() {
  const user = await requireRole(['platform_admin']);
  const supabase = await createClient();

  const { data: institutions } = await supabase.from('institutions').select('id,name,created_at').order('created_at', { ascending: false });
  const { data: users } = await supabase.from('users').select('id,name,email,role').order('created_at', { ascending: false }).limit(20);

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Platform Admin</h1>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Institutions</h3>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Created</TableCell></TableRow></TableHead>
          <TableBody>
            {(institutions ?? []).map((row) => <TableRow key={row.id}><TableCell>{row.name}</TableCell><TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Recent Users</h3>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell></TableRow></TableHead>
          <TableBody>
            {(users ?? []).map((row) => <TableRow key={row.id}><TableCell>{row.name}</TableCell><TableCell>{row.email}</TableCell><TableCell>{row.role}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}

