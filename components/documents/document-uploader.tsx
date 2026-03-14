'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DocumentRow {
  id: string;
  title: string;
  file_url: string;
  bucket: string;
}

export function DocumentUploader({ institutionId, documents }: { institutionId: string; documents: DocumentRow[] }) {
  const [title, setTitle] = useState('');
  const [bucket, setBucket] = useState('investor-documents');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState(documents);

  async function upload() {
    if (!file || !title) return;
    const supabase = createClient();
    const filePath = `${institutionId}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (storageError) return;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, file_url: urlData.publicUrl, bucket, institution_id: institutionId })
    });
    if (!response.ok) return;

    const payload = (await response.json()) as { document: DocumentRow };
    setRows((current) => [payload.document, ...current]);
    setTitle('');
    setFile(null);
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Upload Document</h3>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="w-full rounded-md border border-border px-3 py-2 text-sm" value={bucket} onChange={(e) => setBucket(e.target.value)}>
          <option value="investor-documents">investor-documents</option>
          <option value="proxy-materials">proxy-materials</option>
          <option value="reports">reports</option>
        </select>
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button onClick={upload}>Upload</Button>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Available Documents</h3>
        <ul className="space-y-2">
          {rows.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <span>{doc.title} <span className="text-xs text-slate-500">({doc.bucket})</span></span>
              <a className="text-primary" href={doc.file_url} target="_blank" rel="noreferrer">Download</a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

