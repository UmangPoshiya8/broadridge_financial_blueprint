import { createClient } from '@/lib/supabase/server';
import type { AppUser } from '@/types/domain';

export async function getDashboardMetrics(user: AppUser) {
  const supabase = await createClient();

  const institutionFilter = user.role === 'platform_admin' ? undefined : user.institution_id;

  const shareholdersQ = supabase.from('shareholders').select('*', { count: 'exact', head: true });
  const documentsQ = supabase.from('documents').select('*', { count: 'exact', head: true });
  const votesQ = supabase.from('votes').select('*', { count: 'exact', head: true });
  const tradesQ = supabase.from('trades').select('*', { count: 'exact', head: true });

  if (institutionFilter) {
    shareholdersQ.eq('institution_id', institutionFilter);
    documentsQ.eq('institution_id', institutionFilter);
    tradesQ.eq('institution_id', institutionFilter);
  }

  const [shareholders, documents, votes, trades] = await Promise.all([shareholdersQ, documentsQ, votesQ, tradesQ]);

  return {
    shareholders: shareholders.count ?? 0,
    documents: documents.count ?? 0,
    votingParticipation: votes.count ?? 0,
    trades: trades.count ?? 0
  };
}

export async function getVoteResultsByProposal(meetingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('votes')
    .select('vote, proposals!inner(id,meeting_id,question)')
    .eq('proposals.meeting_id', meetingId);

  const results = new Map<string, { question: string; yes: number; no: number; abstain: number }>();

  data?.forEach((row: { vote: 'yes' | 'no' | 'abstain'; proposals: Array<{ id: string; question: string }> }) => {
    const proposal = row.proposals[0];
    if (!proposal) return;
    const id = proposal.id;
    if (!results.has(id)) {
      results.set(id, { question: proposal.question, yes: 0, no: 0, abstain: 0 });
    }
    const item = results.get(id);
    if (!item) return;
    item[row.vote] += 1;
  });

  return [...results.entries()].map(([id, value]) => ({ id, ...value }));
}
