import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('proposals').select('id,question').eq('meeting_id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ proposals: data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!['platform_admin', 'institution_admin', 'compliance_officer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { question: string };
  if (!body.question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.from('proposals').insert({ meeting_id: id, question: body.question }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ proposal: data });
}
