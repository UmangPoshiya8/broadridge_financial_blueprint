import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { DocumentUploader } from '@/components/documents/document-uploader';

export const metadata: Metadata = { title: 'Documents | InvestorConnect Pro' };

export default async function DocumentsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase.from('documents').select('id,title,file_url,bucket').order('created_at', { ascending: false });
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);
  const { data } = await query;

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Document Delivery Portal</h1>
      <DocumentUploader institutionId={user.institution_id ?? ''} documents={(data ?? []) as Array<{ id: string; title: string; file_url: string; bucket: string }>} />
    </AppShell>
  );
}

