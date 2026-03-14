import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!['platform_admin', 'institution_admin', 'compliance_officer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as {
    title: string;
    file_url: string;
    bucket: string;
    institution_id: string;
  };

  if (!body.title || !body.file_url || !body.bucket || !body.institution_id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (user.role !== 'platform_admin' && body.institution_id !== user.institution_id) {
    return NextResponse.json({ error: 'Unauthorized institution' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from('documents').insert(body).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ document: data });
}

