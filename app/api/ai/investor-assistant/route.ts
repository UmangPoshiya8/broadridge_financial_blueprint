import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { aiPromptSchema } from '@/lib/validations/schemas';

type AssistantContext = {
  shareholderCount: number;
  topShareholders: Array<{ name: string; ownership_percent: number | null }>;
  upcomingMeetings: Array<{ id: string; title: string; meeting_date: string }>;
  settlementsCompletedToday: number;
  today: string;
};

function formatOwnership(ownershipPercent: number | null): string {
  if (ownershipPercent === null) return 'N/A';
  return `${ownershipPercent.toFixed(2)}%`;
}

function deterministicAnswer(query: string, context: AssistantContext): string {
  const lower = query.toLowerCase();
  if (lower.includes('top shareholders')) {
    if (context.topShareholders.length === 0) {
      return 'No shareholder records are available yet. Open Shareholders to add records and view ownership rankings.';
    }
    const ranked = context.topShareholders
      .map((holder, index) => `${index + 1}. ${holder.name} (${formatOwnership(holder.ownership_percent)})`)
      .join(' | ');
    return `Top shareholders right now: ${ranked}. Total shareholders on record: ${context.shareholderCount}.`;
  }
  if (lower.includes('active') && lower.includes('proposal')) {
    if (context.upcomingMeetings.length === 0) {
      return 'There are no upcoming meetings in the schedule, so no active proposal cycle is currently queued.';
    }
    const nextMeeting = context.upcomingMeetings[0];
    return `Review active proposals in Voting for "${nextMeeting.title}" scheduled on ${nextMeeting.meeting_date}.`;
  }
  if (lower.includes('settled today')) {
    return `Completed settlements for ${context.today}: ${context.settlementsCompletedToday}.`;
  }
  const nextMeetingSummary =
    context.upcomingMeetings.length > 0
      ? `${context.upcomingMeetings[0].title} on ${context.upcomingMeetings[0].meeting_date}`
      : 'no upcoming meetings scheduled';
  return `Snapshot for ${context.today}: ${context.shareholderCount} shareholders, ${context.settlementsCompletedToday} completed settlements today, next meeting: ${nextMeetingSummary}. Ask for top shareholders, active proposals, or settlement updates.`;
}

export async function POST(request: Request) {
  await requireUser();

  const parsed = aiPromptSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();

  const [shareholders, topShareholders, meetings, settlementsToday] = await Promise.all([
    supabase.from('shareholders').select('id', { count: 'exact', head: true }),
    supabase.from('shareholders').select('name,ownership_percent').order('ownership_percent', { ascending: false }).limit(3),
    supabase.from('meetings').select('id,title,meeting_date').gte('meeting_date', new Date().toISOString().slice(0, 10)).limit(5),
    supabase.from('settlements').select('id', { count: 'exact', head: true }).eq('status', 'completed').eq('settlement_date', new Date().toISOString().slice(0, 10))
  ]);

  const context: AssistantContext = {
    shareholderCount: shareholders.count ?? 0,
    topShareholders: topShareholders.error ? [] : (topShareholders.data ?? []),
    upcomingMeetings: meetings.data ?? [],
    settlementsCompletedToday: settlementsToday.count ?? 0,
    today: new Date().toISOString().slice(0, 10)
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ answer: deterministicAnswer(parsed.data.query, context) });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const renderedContext = [
    `date: ${context.today}`,
    `shareholder_count: ${context.shareholderCount}`,
    `top_shareholders: ${context.topShareholders.map((holder) => `${holder.name} (${formatOwnership(holder.ownership_percent)})`).join(', ') || 'none'}`,
    `upcoming_meetings: ${context.upcomingMeetings.map((meeting) => `${meeting.title} on ${meeting.meeting_date}`).join(', ') || 'none'}`,
    `settlements_completed_today: ${context.settlementsCompletedToday}`
  ].join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are Investor Assistant for InvestorConnect Pro. Reply in plain language only. Never output raw JSON. Keep responses concise and factual, use only provided context, and explicitly state when data is unavailable.'
      },
      {
        role: 'user',
        content: `Question: ${parsed.data.query}\nContext:\n${renderedContext}`
      }
    ]
  });

  return NextResponse.json({ answer: completion.choices[0]?.message?.content ?? 'No answer generated.' });
}

