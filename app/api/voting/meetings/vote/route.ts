import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { voteSchema } from '@/lib/validations/schemas';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!['investor', 'platform_admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = voteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  const payload = parsed.data;

  const { data: proposal } = await supabase.from('proposals').select('meeting_id').eq('id', payload.proposal_id).single();
  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

  const { data: result, error } = await supabase
    .from('votes')
    .upsert(payload, { onConflict: 'shareholder_id,proposal_id' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ vote: result });
}

