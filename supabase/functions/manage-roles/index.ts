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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, code } = await req.json();

    switch (action) {
      case 'ensure_admin_for_email': {
        // Whitelist of emails allowed to be admins
        const allowedEmails = ['vihaanharrison@gmail.com'];
        if (!allowedEmails.includes((user.email || '').toLowerCase())) {
          return new Response(
            JSON.stringify({ success: false, error: 'Forbidden' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }

        // Check if role exists
        const { count, error: countError } = await adminClient
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (countError) {
          console.error('Role count error:', countError);
          return new Response(
            JSON.stringify({ success: false, error: 'Role check failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        if (!count || count === 0) {
          const { error: insertError } = await adminClient
            .from('user_roles')
            .insert({ user_id: user.id, role: 'admin' });

          if (insertError) {
            console.error('Insert role error:', insertError);
            return new Response(
              JSON.stringify({ success: false, error: 'Grant failed' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'grant_by_code': {
        const secret = Deno.env.get('ADMIN_ACCESS_CODE');
        if (!secret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Access code not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        if (!code || code !== secret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid access code' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }

        const { count, error: countError } = await adminClient
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (countError) {
          console.error('Role count error:', countError);
          return new Response(
            JSON.stringify({ success: false, error: 'Role check failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        if (!count || count === 0) {
          const { error: insertError } = await adminClient
            .from('user_roles')
            .insert({ user_id: user.id, role: 'admin' });

          if (insertError) {
            console.error('Insert role error:', insertError);
            return new Response(
              JSON.stringify({ success: false, error: 'Grant failed' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in manage-roles:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
