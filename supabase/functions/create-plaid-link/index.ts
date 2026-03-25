import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Note: To use this, you must set PLAID_CLIENT_ID and PLAID_SECRET in your Supabase project dashboard.
const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID') ?? '';
const PLAID_SECRET = Deno.env.get('PLAID_SECRET') ?? '';
const PLAID_ENV = 'sandbox'; // change to 'development' or 'production' later
const PLAID_URL = `https://${PLAID_ENV}.plaid.com/link/token/create`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { user_id } = body;

    const plaidPayload = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      client_name: 'Finguard Intelligence Hub',
      user: {
        client_user_id: user_id || 'anonymous-tenant-id',
      },
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await fetch(PLAID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plaidPayload),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Plaid API error: ${err}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ link_token: data.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
