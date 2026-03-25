import { z } from 'zod';

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const ObligationSchema = z.object({
  id: z.string(), // text in Supabase (not uuid)
  amount: z.number().positive(),
  due_date: z.string(),
  counterparty: z.string(),
  flexibility_score: z.number().optional().default(5),
  category: z.string().optional().default('Finance'),
  notes: z.string().optional().default(''),
});

export const NegotiationSchema = z.object({
  obligation_id: z.string(),
  strategy_type: z.enum(['delay', 'payment_plan', 'partial']),
  message: z.string().min(1),
  status: z.enum(['draft', 'sent', 'responded']).default('draft'),
  channel: z.enum(['email', 'sms', 'call']).default('email'),
  tone: z.number().min(0).max(100).default(50),
});

export const ResponseSchema = z.object({
  negotiation_id: z.string(),
  response_text: z.string(),
  outcome: z.enum(['accepted', 'rejected', 'counter', 'pending']).default('pending'),
});

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type ObligationRow = z.infer<typeof ObligationSchema>;
export type StrategyType = 'delay' | 'payment_plan' | 'partial';
export type NegotiationStatus = 'draft' | 'sent' | 'responded';
export type Channel = 'email' | 'sms' | 'call';

export type Negotiation = {
  id: string;
  obligation_id: string;
  strategy_type: StrategyType;
  message: string;
  status: NegotiationStatus;
  channel: Channel;
  tone: number;
  created_at?: string;
  // Joined from obligations
  counterparty?: string;
  amount?: number;
  due_date?: string;
};

export type NegotiationResponse = {
  id: string;
  negotiation_id: string;
  response_text: string;
  outcome: 'accepted' | 'rejected' | 'counter' | 'pending';
  created_at?: string;
};

export type GenerateResult = {
  strategy: StrategyType;
  message: string;
  negotiation_id?: string;
};
