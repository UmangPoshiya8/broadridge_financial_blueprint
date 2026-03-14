import { z } from 'zod';

export const shareholderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  institution_id: z.string().uuid(),
  ownership_percent: z.number().min(0).max(100)
});

export const communicationSchema = z.object({
  institution_id: z.string().uuid(),
  message: z.string().min(5),
  type: z.enum(['announcement', 'proxy_statement', 'report'])
});

export const voteSchema = z.object({
  proposal_id: z.string().uuid(),
  shareholder_id: z.string().uuid(),
  vote: z.enum(['yes', 'no', 'abstain'])
});

export const aiPromptSchema = z.object({
  query: z.string().min(3)
});

