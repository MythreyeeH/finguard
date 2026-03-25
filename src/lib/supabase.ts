import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getClient(): SupabaseClient {
  return supabase;
}

/**
 * Pushes validated, deduplicated obligations to the Supabase database.
 */
export async function pushObligationsToDB(obligations: any[]) {
  if (!obligations.length) return { success: true, count: 0 };

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase not configured — skipping DB push. Add keys to .env.local.");
    return { success: true, count: obligations.length, skipped: true };
  }

  try {
    const client = getClient();
    const { data, error } = await client.from('obligations').insert(obligations);
    if (error) { console.error("Supabase push error:", error); return { success: false, error }; }
    return { success: true, count: obligations.length, data };
  } catch (err: any) {
    console.error("Supabase error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches the initial cash balance from the database.
 */
export async function fetchInitialBalance(userId?: string) {
  if (!supabaseUrl || !supabaseAnonKey || !userId) {
    return { success: false, error: "Supabase not configured or missing userId" };
  }
  try {
    const client = getClient();
    const { data, error } = await client.from('user_settings').select('cash_balance').eq('user_id', userId).single();
    if (error) {
      if (error.code === 'PGRST116') return { success: true, count: 0, data: null }; // No row
      return { success: false, error };
    }
    return { success: true, data: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Saves the initial cash balance to the database.
 */
export async function saveInitialBalance(amount: number, userId?: string) {
  if (!supabaseUrl || !supabaseAnonKey || !userId) {
    return { success: false, error: "Supabase not configured or missing userId" };
  }
  try {
    const client = getClient();
    const { data, error } = await client.from('user_settings').upsert({ user_id: userId, cash_balance: amount });
    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
