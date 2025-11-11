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
    const { action, password, projectData, projectId } = await req.json();

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
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        break;

      case 'update':
        result = await supabaseClient
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .select()
          .single();
        break;

      case 'delete':
        result = await supabaseClient
          .from('projects')
          .delete()
          .eq('id', projectId);
        break;

      case 'toggleFeatured':
        // First, check how many featured projects exist
        const { data: featuredProjects } = await supabaseClient
          .from('projects')
          .select('id, is_featured')
          .eq('is_featured', true);

        const currentProject = await supabaseClient
          .from('projects')
          .select('is_featured')
          .eq('id', projectId)
          .single();

        const willBeFeatured = !currentProject.data?.is_featured;

        if (willBeFeatured && featuredProjects && featuredProjects.length >= 6) {
          return new Response(
            JSON.stringify({ success: false, error: 'Maximum 6 featured projects allowed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        result = await supabaseClient
          .from('projects')
          .update({ is_featured: willBeFeatured })
          .eq('id', projectId)
          .select()
          .single();
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
    console.error('Error in manage-projects:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
