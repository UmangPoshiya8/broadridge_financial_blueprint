import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/session';

const allowedRoles = new Set(['institution_admin', 'compliance_officer']);

export async function POST(request: Request) {
  await requireRole(['platform_admin']);
  const body = (await request.json()) as {
    name: string;
    email: string;
    role: 'institution_admin' | 'compliance_officer';
    institution_id: string;
  };

  if (!body.name || !body.email || !body.role || !body.institution_id || !allowedRoles.has(body.role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: body.name,
      email: body.email,
      role: body.role,
      institution_id: body.institution_id
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: data });
}

