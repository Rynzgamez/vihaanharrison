import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get stored password
    const { data, error } = await supabaseClient
      .from('admin_credentials')
      .select('password_hash')
      .single();

    if (error) {
      console.error('Error fetching credentials:', error);
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Authentication error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Simple password comparison (in production, use proper hashing)
    const authenticated = password === data.password_hash;

    return new Response(
      JSON.stringify({ authenticated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in admin-auth:', error);
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
