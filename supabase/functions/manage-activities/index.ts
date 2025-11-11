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
    const { action, password, activityData, activityId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify password
    const { data: credentials } = await supabaseClient
      .from('admin_credentials')
      .select('password_hash')
      .single();

    if (password !== credentials?.password_hash) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    let result;

    switch (action) {
      case 'create':
        result = await supabaseClient
          .from('activities')
          .insert([activityData])
          .select()
          .single();
        break;

      case 'update':
        result = await supabaseClient
          .from('activities')
          .update(activityData)
          .eq('id', activityId)
          .select()
          .single();
        break;

      case 'delete':
        result = await supabaseClient
          .from('activities')
          .delete()
          .eq('id', activityId);
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in manage-activities:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
