'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
}

export function MeetingManager({ institutionId, meetings }: { institutionId: string; meetings: Meeting[] }) {
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [rows, setRows] = useState(meetings);

  async function createMeeting() {
    const response = await fetch('/api/voting/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id: institutionId, title, meeting_date: meetingDate })
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { meeting: Meeting };
    setRows((current) => [payload.meeting, ...current]);
    setTitle('');
    setMeetingDate('');
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold">Meetings</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" />
        <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
        <Button onClick={createMeeting}>Create meeting</Button>
      </div>
      <ul className="space-y-2">
        {rows.map((meeting) => (
          <li key={meeting.id} className="rounded-md border border-border p-3">
            <a className="font-medium text-primary" href={`/vote/${meeting.id}`}>{meeting.title}</a>
            <p className="text-sm text-slate-500">{meeting.meeting_date}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

