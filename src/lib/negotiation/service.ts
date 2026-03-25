import { createClient } from '@supabase/supabase-js';
import { chooseStrategy } from './strategy';
import { generateNegotiationMessage } from './gemini';
import { ObligationRow, Negotiation, NegotiationResponse, GenerateResult, Channel } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// ─── 1. Fetch Obligation ─────────────────────────────────────────────────────

export async function fetchObligation(obligation_id: string): Promise<ObligationRow> {
  const { data, error } = await supabase
    .from('obligations')
    .select('*')
    .eq('id', obligation_id)
    .single();

  if (error) throw new Error(`Failed to fetch obligation: ${error.message}`);
  if (!data) throw new Error(`Obligation ${obligation_id} not found`);

  return {
    id: data.id,
    amount: data.amount,
    due_date: data.due_date || data.dueDate,
    counterparty: data.counterparty || 'Unknown',
    flexibility_score: data.flexibility_score ?? data.riskWeight ?? 5,
    category: data.category || 'Finance',
    notes: data.notes || '',
  };
}

// ─── 2. Generate + Save Negotiation ─────────────────────────────────────────

export async function generateAndSaveNegotiation(
  obligation_id: string,
  tone: number = 50,
  channel: Channel = 'email'
): Promise<GenerateResult> {
  // Fetch obligation
  const obligation = await fetchObligation(obligation_id);

  // Decide strategy
  const strategy = chooseStrategy(obligation);

  // Generate message via Gemini
  const message = await generateNegotiationMessage(obligation, strategy, tone, channel);

  // Save to Supabase
  const { data, error } = await supabase
    .from('negotiations')
    .insert({
      obligation_id,
      strategy_type: strategy,
      message,
      status: 'draft',
      channel,
      tone,
    })
    .select()
    .single();

  if (error) {
    console.warn('Could not save to negotiations table:', error.message);
    // Return result anyway — UI still receives the message
    return { strategy, message };
  }

  return { strategy, message, negotiation_id: data?.id };
}

// ─── 3. Fetch All Negotiations ───────────────────────────────────────────────

export async function fetchNegotiations(): Promise<Negotiation[]> {
  const { data, error } = await supabase
    .from('negotiations')
    .select(`
      *,
      obligations (counterparty, amount, due_date)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((n: any) => ({
    id: n.id,
    obligation_id: n.obligation_id,
    strategy_type: n.strategy_type,
    message: n.message,
    status: n.status,
    channel: n.channel || 'email',
    tone: n.tone ?? 50,
    created_at: n.created_at,
    counterparty: n.obligations?.counterparty,
    amount: n.obligations?.amount,
    due_date: n.obligations?.due_date,
  }));
}

// ─── 4. Update Status ────────────────────────────────────────────────────────

export async function updateNegotiationStatus(
  id: string,
  status: 'draft' | 'sent' | 'responded'
): Promise<void> {
  const { error } = await supabase
    .from('negotiations')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update status: ${error.message}`);
}

// ─── 5. Log Response ─────────────────────────────────────────────────────────

export async function logNegotiationResponse(
  negotiation_id: string,
  response_text: string,
  outcome: NegotiationResponse['outcome']
): Promise<void> {
  const { error } = await supabase
    .from('responses')
    .insert({ negotiation_id, response_text, outcome });

  if (error) throw new Error(`Failed to log response: ${error.message}`);

  // Auto-update negotiation status to "responded"
  await updateNegotiationStatus(negotiation_id, 'responded');
}

// ─── 6. Real-time Subscription ───────────────────────────────────────────────

export function subscribeToNegotiations(
  callback: (negotiations: Negotiation[]) => void
) {
  const channel = supabase
    .channel('negotiations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'negotiations' }, async () => {
      const negotiations = await fetchNegotiations();
      callback(negotiations);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── 7. Regenerate (tone/channel change) ─────────────────────────────────────

export async function regenerateMessage(
  negotiation_id: string,
  tone: number,
  channel: Channel
): Promise<string> {
  // Fetch existing negotiation
  const { data: neg, error } = await supabase
    .from('negotiations')
    .select('*, obligations(*)')
    .eq('id', negotiation_id)
    .single();

  if (error || !neg) throw new Error('Failed to fetch negotiation for regeneration');

  const obligation: ObligationRow = {
    id: neg.obligations.id,
    amount: neg.obligations.amount,
    due_date: neg.obligations.due_date || neg.obligations.dueDate,
    counterparty: neg.obligations.counterparty,
    flexibility_score: neg.obligations.flexibility_score ?? 5,
    notes: neg.obligations.notes || '',
  };

  const newMessage = await generateNegotiationMessage(obligation, neg.strategy_type, tone, channel);

  // Update in DB
  await supabase
    .from('negotiations')
    .update({ message: newMessage, tone, channel })
    .eq('id', negotiation_id);

  return newMessage;
}
