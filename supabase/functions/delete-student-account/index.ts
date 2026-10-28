import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Define CORS headers directly in this file to avoid import issues
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  console.log('Delete Student Account function called')
  console.log('Request method:', req.method)
  console.log('Request headers:', [...req.headers.entries()])

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('Creating Supabase client...')
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = (Deno.env.get('SB_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')) ?? ''
    
    console.log('Supabase URL:', supabaseUrl)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header provided')
      throw new Error('No Authorization header provided')
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    console.log('Getting user...')
    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      console.error('User error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }

    if (!user) {
      console.error('No user found in token')
      throw new Error('No user found in token')
    }

    console.log('User authenticated:', user.id)
    console.log('Verifying student profile...')
    // Verify that the user is a student
    const { data: studentProfile, error: profileError } = await supabaseClient
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error(`Student profile error: ${profileError.message}`)
    }

    if (!studentProfile) {
      console.error('No student profile found')
      throw new Error('Not a student account')
    }

    console.log('Student profile confirmed, proceeding with deletion')
    console.log('Deleting related data...')
    
    // Delete related data
    try {
      // Delete lesson requests
      const { error: lessonError } = await supabaseClient
        .from('lesson_requests')
        .delete()
        .eq('student_id', user.id)
      
      if (lessonError) {
        console.error('Error deleting lessons:', lessonError)
      } else {
        console.log('Lesson requests deleted successfully')
      }

      // Delete favorites
      const { error: favError } = await supabaseClient
        .from('favorites')
        .delete()
        .eq('student_id', user.id)
      
      if (favError) {
        console.error('Error deleting favorites:', favError)
      } else {
        console.log('Favorites deleted successfully')
      }

      // Delete chat messages
      const { error: chatError } = await supabaseClient
        .from('chat_messages')
        .delete()
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      
      if (chatError) {
        console.error('Error deleting chat messages:', chatError)
      } else {
        console.log('Chat messages deleted successfully')
      }

      // Delete student profile
      const { error: profileDelError } = await supabaseClient
        .from('student_profiles')
        .delete()
        .eq('user_id', user.id)
      
      if (profileDelError) {
        console.error('Error deleting profile:', profileDelError)
      } else {
        console.log('Student profile deleted successfully')
      }

    } catch (deleteError) {
      console.error('Error in deletion process:', deleteError)
      throw deleteError
    }

    console.log('Deleting user account...')
    // Delete the user from auth.users (requires admin rights)
    const serviceRoleKey = (Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) ?? ''
    if (!serviceRoleKey) {
      console.error('SERVICE_ROLE_KEY is not set')
      throw new Error('Server configuration error')
    }
    
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      throw new Error(`Error deleting user: ${deleteUserError.message}`)
    }

    console.log('Account deletion successful')
    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})