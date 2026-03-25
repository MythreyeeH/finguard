import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy client — only instantiated when keys are present to avoid a hard crash during development
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to artifacts/finguard/.env.local");
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
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
