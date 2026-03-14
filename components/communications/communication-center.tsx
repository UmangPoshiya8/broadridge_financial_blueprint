'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Communication {
  id: string;
  message: string;
  type: string;
  created_at: string;
}

export function CommunicationCenter({ institutionId, items }: { institutionId: string; items: Communication[] }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [rows, setRows] = useState(items);

  async function sendMessage() {
    const response = await fetch('/api/communications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id: institutionId, message, type })
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { communication: Communication };
    setRows((current) => [payload.communication, ...current]);
    setMessage('');
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Send In-App Communication</h3>
        <select className="w-full rounded-md border border-border px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="announcement">Announcement</option>
          <option value="proxy_statement">Proxy Statement</option>
          <option value="report">Report</option>
        </select>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write investor communication" rows={4} />
        <Button onClick={sendMessage}>Send</Button>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Communication History</h3>
        <ul className="space-y-2">
          {rows.map((item) => (
            <li key={item.id} className="rounded-md border border-border p-3">
              <p className="text-sm text-slate-500">{item.type} - {new Date(item.created_at).toLocaleString()}</p>
              <p className="mt-1">{item.message}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

