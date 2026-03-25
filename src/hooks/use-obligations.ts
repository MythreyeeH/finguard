import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Obligation = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  counterparty: string;
  status: 'overdue' | 'due-soon' | 'upcoming' | 'paid';
  priority: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  notes: string;
  penaltyRate?: string;
  canDeferText?: string;
  riskWeight?: number;
};

export function useObligations() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapDbToUi = (dbRow: any): Obligation => ({
    id: dbRow.id,
    name: dbRow.name || dbRow.counterparty || 'Generic Obligation',
    amount: dbRow.amount,
    dueDate: dbRow.due_date || dbRow.dueDate, // Handle both conventions
    category: dbRow.category || 'Finance',
    counterparty: dbRow.counterparty || 'Unknown',
    status: dbRow.status || 'upcoming',
    priority: dbRow.priority || 'medium',
    score: dbRow.score || 5.0,
    notes: dbRow.notes || dbRow.ai_reasoning || '',
    penaltyRate: dbRow.penaltyRate || dbRow.penalty_rate,
    canDeferText: dbRow.canDeferText || (dbRow.is_deferrable ? 'Available' : 'None'),
    riskWeight: dbRow.riskWeight || dbRow.risk_weight
  });

  const fetchObligations = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('obligations')
        .select('*')
        .order('due_date', { ascending: true }); // Prefer due_date for sorting

      if (supabaseError) throw supabaseError;
      setObligations((data || []).map(mapDbToUi));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addObligation = async (newObligation: Omit<Obligation, 'id'>) => {
    try {
      // Prepare for DB (map back to DB schema if necessary, but here we just pass as is for simplicity assuming DB accepts these keys)
      const dbPayload = {
        name: newObligation.name,
        amount: newObligation.amount,
        due_date: newObligation.dueDate,
        category: newObligation.category,
        counterparty: newObligation.counterparty,
        status: newObligation.status,
        priority: newObligation.priority,
        score: newObligation.score,
        notes: newObligation.notes,
        is_deferrable: newObligation.canDeferText !== 'None'
      };

      const { data, error: supabaseError } = await supabase
        .from('obligations')
        .insert([dbPayload])
        .select();

      if (supabaseError) throw supabaseError;
      if (data) {
        setObligations(prev => [...prev, mapDbToUi(data[0])]);
      }
      return { success: true, data: data?.[0] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateObligationStatus = async (id: string, status: Obligation['status']) => {
    try {
      const { error: supabaseError } = await supabase
        .from('obligations')
        .update({ status })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      setObligations(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchObligations();
  }, []);

  return {
    obligations,
    loading,
    error,
    refresh: fetchObligations,
    addObligation,
    updateObligationStatus
  };
}
