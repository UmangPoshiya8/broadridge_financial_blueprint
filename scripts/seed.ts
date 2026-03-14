import 'dotenv/config'
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separator = trimmed.indexOf('=');
    if (separator < 0) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type DemoUser = {
  email: string;
  password: string;
  role: 'platform_admin' | 'institution_admin' | 'compliance_officer' | 'investor';
  name: string;
};

const demoUsers: DemoUser[] = [
  {
    email: 'umang.poshiya@bacancy.com',
    password: 'Demo@123',
    role: 'platform_admin',
    name: 'Umang Platform Admin'
  },
  {
    email: 'umang.poshiyaia@mailinator.com',
    password: 'Demo@123',
    role: 'institution_admin',
    name: 'Umang Institution Admin'
  },
  {
    email: 'umang.poshiyaco@mailinator.com',
    password: 'Demo@123',
    role: 'compliance_officer',
    name: 'Umang Compliance Officer'
  },
  {
    email: 'umang.poshiyais1@mailinator.com',
    password: 'Demo@123',
    role: 'investor',
    name: 'Umang Investor One'
  },
  {
    email: 'umang.poshiyais2@mailinator.com',
    password: 'Demo@123',
    role: 'investor',
    name: 'Umang Investor Two'
  }
];

async function ensureUser(demoUser: DemoUser, institutionId: string) {
  const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = listed.data.users.find((user) => user.email?.toLowerCase() === demoUser.email.toLowerCase());
  const existingProfile = await supabase.from('users').select('id,email').eq('email', demoUser.email).maybeSingle();

  const payload = {
    email: demoUser.email,
    password: demoUser.password,
    email_confirm: true,
    user_metadata: {
      name: demoUser.name,
      role: demoUser.role,
      institution_id: institutionId
    },
    app_metadata: {
      created_by_platform_admin: true
    }
  };

  let userId = existing?.id;

  if (!existing) {
    if (existingProfile.data?.id) {
      const { error: cleanupError } = await supabase.from('users').delete().eq('id', existingProfile.data.id);
      if (cleanupError) throw cleanupError;
    }
    const created = await supabase.auth.admin.createUser(payload);
    if (created.error || !created.data.user) throw created.error ?? new Error('Failed to create user');
    userId = created.data.user.id;
  } else {
    const updated = await supabase.auth.admin.updateUserById(existing.id, payload);
    if (updated.error) throw updated.error;
  }

  if (!userId) throw new Error('Missing user id');

  const { error: upsertError } = await supabase.from('users').upsert({
    id: userId,
    name: demoUser.name,
    email: demoUser.email,
    role: demoUser.role,
    institution_id: institutionId
  });

  if (upsertError) throw upsertError;

  return userId;
}

async function main() {
  const { data: institution, error: institutionError } = await supabase
    .from('institutions')
    .upsert({ name: 'Bacancy Capital Markets' }, { onConflict: 'name' })
    .select('id')
    .single();

  if (institutionError || !institution) throw institutionError ?? new Error('Institution seed failed');

  const institutionId = institution.id;

  const userIds: Record<string, string> = {};
  for (const demoUser of demoUsers) {
    userIds[demoUser.email] = await ensureUser(demoUser, institutionId);
  }

  const shareholderNames = [
    'Aarav Shah',
    'Mia Patel',
    'Liam Chen',
    'Noah Martinez',
    'Emma Wilson',
    'Olivia Thompson',
    'Sophia Clark',
    'Lucas Wright',
    'Isabella Allen',
    'Ethan King'
  ];

  const shareholderRows = shareholderNames.map((name, index) => {
    const investorEmail = index === 0 ? 'umang.poshiyais1@mailinator.com' : index === 1 ? 'umang.poshiyais2@mailinator.com' : `shareholder${index + 1}@example.com`;

    return {
      name,
      email: investorEmail,
      institution_id: institutionId,
      ownership_percent: Number((Math.random() * 12 + 1).toFixed(2)),
      beneficial_owner: index % 3 === 0 ? 'Nominee Account' : 'Direct Holder'
    };
  });

  const { data: seededShareholders, error: shareholderError } = await supabase
    .from('shareholders')
    .upsert(shareholderRows, { onConflict: 'email,institution_id' })
    .select('id,email');

  if (shareholderError || !seededShareholders) throw shareholderError ?? new Error('Shareholders seed failed');

  const securities = [
    { name: 'Bacancy Growth Fund', ticker: 'BGF' },
    { name: 'Bacancy Income Bond', ticker: 'BIB' },
    { name: 'Bacancy Digital Infra', ticker: 'BDI' }
  ];

  const { data: seededSecurities, error: securityError } = await supabase
    .from('securities')
    .upsert(securities.map((security) => ({ ...security, institution_id: institutionId })), { onConflict: 'ticker,institution_id' })
    .select('id,ticker');

  if (securityError || !seededSecurities) throw securityError ?? new Error('Securities seed failed');

  const positions = seededShareholders.flatMap((shareholder) =>
    seededSecurities.map((security) => ({
      shareholder_id: shareholder.id,
      security_id: security.id,
      shares: Number((Math.random() * 1000 + 100).toFixed(2))
    }))
  );
  const { error: positionsError } = await supabase.from('positions').upsert(positions, { onConflict: 'shareholder_id,security_id' });
  if (positionsError) throw positionsError;

  const today = new Date();
  const trades = Array.from({ length: 20 }, (_, index) => {
    const tradeDate = new Date(today);
    tradeDate.setDate(today.getDate() - (index % 10));
    const security = seededSecurities[index % seededSecurities.length];

    return {
      institution_id: institutionId,
      security_id: security.id,
      quantity: Number((Math.random() * 2000 + 50).toFixed(2)),
      price: Number((Math.random() * 120 + 10).toFixed(2)),
      trade_date: tradeDate.toISOString().slice(0, 10)
    };
  });

  const { data: seededTrades, error: tradesError } = await supabase.from('trades').insert(trades).select('id,trade_date');
  if (tradesError || !seededTrades) throw tradesError ?? new Error('Trades seed failed');

  const settlements = seededTrades.map((trade, index) => {
    const settlementDate = new Date(trade.trade_date);
    settlementDate.setDate(settlementDate.getDate() + 2);
    return {
      trade_id: trade.id,
      settlement_date: settlementDate.toISOString().slice(0, 10),
      status: index % 4 === 0 ? 'pending' : 'completed'
    };
  });
  const { error: settlementsError } = await supabase.from('settlements').upsert(settlements, { onConflict: 'trade_id' });
  if (settlementsError) throw settlementsError;

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .upsert(
      {
        institution_id: institutionId,
        title: 'Annual General Meeting 2026',
        meeting_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString().slice(0, 10)
      },
      { onConflict: 'institution_id,title' }
    )
    .select('id')
    .single();

  if (meetingError || !meeting) throw meetingError ?? new Error('Meeting seed failed');

  const proposals = [
    { meeting_id: meeting.id, question: 'Approve board reappointments for FY 2026?' },
    { meeting_id: meeting.id, question: 'Approve dividend distribution proposal?' },
    { meeting_id: meeting.id, question: 'Approve external audit partner renewal?' }
  ];

  const { data: seededProposals, error: proposalsError } = await supabase
    .from('proposals')
    .upsert(proposals, { onConflict: 'meeting_id,question' })
    .select('id');

  if (proposalsError || !seededProposals) throw proposalsError ?? new Error('Proposals seed failed');

  const votes = seededShareholders.flatMap((shareholder) =>
    seededProposals.map((proposal, idx) => ({
      shareholder_id: shareholder.id,
      proposal_id: proposal.id,
      vote: idx % 3 === 0 ? 'yes' : idx % 3 === 1 ? 'no' : 'abstain'
    }))
  );
  const { error: votesError } = await supabase.from('votes').upsert(votes, { onConflict: 'shareholder_id,proposal_id' });
  if (votesError) throw votesError;

  const documents = [
    {
      title: '2026 Proxy Statement',
      file_url: `https://example.com/${institutionId}/proxy-statement-2026.pdf`,
      bucket: 'proxy-materials',
      institution_id: institutionId
    },
    {
      title: 'Q4 Earnings Report',
      file_url: `https://example.com/${institutionId}/q4-earnings-report.pdf`,
      bucket: 'reports',
      institution_id: institutionId
    },
    {
      title: 'Investor Notice Letter',
      file_url: `https://example.com/${institutionId}/investor-notice.pdf`,
      bucket: 'investor-documents',
      institution_id: institutionId
    }
  ];
  const { error: docsError } = await supabase.from('documents').upsert(documents, { onConflict: 'title,institution_id' });
  if (docsError) throw docsError;

  const communications = [
    {
      institution_id: institutionId,
      message: 'AGM schedule has been published. Please review proxy materials.',
      type: 'announcement'
    },
    {
      institution_id: institutionId,
      message: 'Quarterly investor report is now available in the documents portal.',
      type: 'report'
    }
  ];
  const { data: commRows, error: commError } = await supabase.from('communications').insert(communications).select('message');
  if (commError || !commRows) throw commError ?? new Error('Communications seed failed');

  const notifications = Object.values(userIds).flatMap((userId) =>
    commRows.map((comm) => ({ user_id: userId, message: comm.message, read_status: false }))
  );
  const { error: notificationError } = await supabase.from('notifications').insert(notifications);
  if (notificationError) throw notificationError;

  const { error: auditError } = await supabase.from('audit_logs').insert({
    user_id: userIds['umang.poshiya@bacancy.com'],
    action: 'Seeded InvestorConnect Pro demo data'
  });
  if (auditError) throw auditError;

  console.log('Seed complete. Demo accounts created and dataset populated.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
