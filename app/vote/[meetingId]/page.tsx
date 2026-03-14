import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { VotingBallot } from '@/components/voting/voting-ballot';

export const metadata: Metadata = { title: 'Vote | InvestorConnect Pro' };

export default async function VotePage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: meeting } = await supabase.from('meetings').select('id,title').eq('id', meetingId).single();
  if (!meeting) notFound();

  const { data: proposals } = await supabase.from('proposals').select('id,question').eq('meeting_id', meetingId);
  const { data: shareholder } = await supabase
    .from('shareholders')
    .select('id')
    .eq('email', user.email)
    .eq('institution_id', user.institution_id)
    .maybeSingle();

  return (
    <AppShell userName={user.name}>
      <h1 className="text-2xl font-semibold">Vote: {meeting.title}</h1>
      {!shareholder ? (
        <p className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm">Your user is not linked to a shareholder record.</p>
      ) : (
        <VotingBallot proposals={(proposals ?? []) as Array<{ id: string; question: string }>} shareholderId={shareholder.id} />
      )}
    </AppShell>
  );
}
