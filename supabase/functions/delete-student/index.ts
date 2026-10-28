import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Define CORS headers with wildcard to accept all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      (Deno.env.get('SB_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')) ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get user ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Delete related data - specifically handle each one
    
    // 1. Delete lesson requests
    await supabaseClient
      .from('lesson_requests')
      .delete()
      .eq('student_id', user.id)

    // 2. Delete favorites
    await supabaseClient
      .from('favorites')
      .delete()
      .eq('student_id', user.id)

    // 3. Delete chat messages
    await supabaseClient
      .from('chat_messages')
      .delete()
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    // 4. Delete profile views
    await supabaseClient
      .from('profile_views')
      .delete()
      .eq('viewer_id', user.id)

    // 5. Delete student profile
    const { error: profileError } = await supabaseClient
      .from('student_profiles')
      .delete()
      .eq('user_id', user.id)
    
    if (profileError) {
      throw new Error(`Failed to delete student profile: ${profileError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
