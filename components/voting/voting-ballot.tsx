'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Proposal {
  id: string;
  question: string;
}

export function VotingBallot({ proposals, shareholderId }: { proposals: Proposal[]; shareholderId: string }) {
  const [votes, setVotes] = useState<Record<string, 'yes' | 'no' | 'abstain'>>({});
  const [done, setDone] = useState(false);

  async function submitVote() {
    for (const proposal of proposals) {
      const vote = votes[proposal.id] ?? 'abstain';
      await fetch('/api/voting/meetings/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposal.id, shareholder_id: shareholderId, vote })
      });
    }
    setDone(true);
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <div key={proposal.id} className="rounded-md border border-border bg-white p-4">
          <p className="font-medium">{proposal.question}</p>
          <div className="mt-2 flex gap-3 text-sm">
            {(['yes', 'no', 'abstain'] as const).map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={proposal.id}
                  value={option}
                  checked={(votes[proposal.id] ?? 'abstain') === option}
                  onChange={() => setVotes((current) => ({ ...current, [proposal.id]: option }))}
                />
                {option.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={submitVote}>Submit vote</Button>
      {done ? <p className="text-green-600">Votes submitted.</p> : null}
    </div>
  );
}

