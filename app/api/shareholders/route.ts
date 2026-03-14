import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { shareholderSchema } from '@/lib/validations/schemas';

export async function GET() {
  const user = await requireUser();
  const supabase = await createClient();

  const query = supabase.from('shareholders').select('*').order('name');
  if (user.role !== 'platform_admin' && user.institution_id) query.eq('institution_id', user.institution_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ shareholders: data });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!['platform_admin', 'institution_admin', 'compliance_officer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = shareholderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (user.role !== 'platform_admin' && parsed.data.institution_id !== user.institution_id) {
    return NextResponse.json({ error: 'Unauthorized institution' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from('shareholders').insert(parsed.data).select('*').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ shareholder: data });
}

