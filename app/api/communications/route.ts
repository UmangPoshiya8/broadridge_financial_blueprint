import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { communicationSchema } from '@/lib/validations/schemas';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!['platform_admin', 'institution_admin', 'compliance_officer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = communicationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (user.role !== 'platform_admin' && parsed.data.institution_id !== user.institution_id) {
    return NextResponse.json({ error: 'Unauthorized institution' }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: communication, error } = await supabase
    .from('communications')
    .insert(parsed.data)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: users } = await supabase.from('users').select('id').eq('institution_id', parsed.data.institution_id);
  if (users?.length) {
    const notifications = users.map((institutionUser) => ({
      user_id: institutionUser.id,
      message: parsed.data.message,
      read_status: false
    }));
    await supabase.from('notifications').insert(notifications);
  }

  return NextResponse.json({ communication });
}

