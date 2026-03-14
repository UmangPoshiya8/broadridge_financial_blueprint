'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

interface Shareholder {
  id: string;
  name: string;
  email: string;
  ownership_percent: number;
}

export function ShareholdersTable({ items, institutionId }: { items: Shareholder[]; institutionId: string }) {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ownership, setOwnership] = useState('0');
  const [rows, setRows] = useState(items);

  const filtered = useMemo(() => {
    return rows.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  async function createShareholder() {
    const response = await fetch('/api/shareholders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        ownership_percent: Number(ownership),
        institution_id: institutionId
      })
    });

    if (!response.ok) return;
    const payload = (await response.json()) as { shareholder: Shareholder };
    setRows((current) => [payload.shareholder, ...current]);
    setName('');
    setEmail('');
    setOwnership('0');
  }

  async function deleteShareholder(id: string) {
    const response = await fetch(`/api/shareholders/${id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setRows((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Create Shareholder</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="number" placeholder="Ownership %" value={ownership} onChange={(e) => setOwnership(e.target.value)} />
          <Button onClick={createShareholder}>Create</Button>
        </div>
      </Card>
      <Card className="space-y-3">
        <Input placeholder="Search shareholders" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ownership %</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.ownership_percent}</TableCell>
                <TableCell><Button variant="destructive" onClick={() => deleteShareholder(row.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

