'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function InvestorAssistant() {
  const [query, setQuery] = useState('Show top shareholders');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    const response = await fetch('/api/ai/investor-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = (await response.json()) as { answer?: string; error?: string };
    setAnswer(data.answer ?? data.error ?? 'No response');
    setLoading(false);
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold">Investor Assistant</h3>
      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={ask} disabled={loading}>{loading ? 'Thinking...' : 'Ask'}</Button>
      </div>
      {answer ? <p className="rounded-md bg-muted p-3 text-sm">{answer}</p> : null}
    </Card>
  );
}

