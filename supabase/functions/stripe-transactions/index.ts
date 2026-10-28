import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function received request')
    
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const jwt = authHeader.replace('Bearer ', '')

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      (Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) ?? '',
    )

    // Get user from JWT
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError || !userData.user) {
      throw new Error('Invalid token')
    }
    const user = userData.user

    console.log('User authenticated:', user.id)

    // Verify admin access
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    console.log('Admin access verified')

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    console.log('Stripe initialized')

    // Parse request body
    const requestData = await req.json()
    const { dateFilter, status } = requestData
    
    console.log('Request data:', JSON.stringify(requestData))

    // Build Stripe query parameters
    const params: any = {
      limit: 100 // We'll keep this as is but implement pagination
    }

    if (dateFilter) {
      params.created = {
        gte: Math.floor(dateFilter.start / 1000),
        lte: Math.floor(dateFilter.end / 1000)
      }
    }

    if (status) {
      params.status = status
    }

    console.log('Fetching transactions with params:', JSON.stringify(params))

    // Fetch transactions from Stripe with pagination
    try {
      let allTransactions = [];
      let hasMore = true;
      let startingAfter = undefined;

      while (hasMore) {
        if (startingAfter) {
          params.starting_after = startingAfter;
        }

        const transactionBatch = await stripe.paymentIntents.list(params);
        allTransactions = [...allTransactions, ...transactionBatch.data];
        
        hasMore = transactionBatch.has_more;
        if (hasMore && transactionBatch.data.length > 0) {
          startingAfter = transactionBatch.data[transactionBatch.data.length - 1].id;
        }

        // Safety check to prevent infinite loops
        if (allTransactions.length >= 1000) {
          console.log('Reached maximum transaction fetch limit of 1000');
          hasMore = false;
        }
      }

      console.log(`Retrieved ${allTransactions.length} transactions from Stripe`)
      
      // Transform Stripe data to match our schema
      const transformedData = allTransactions.map(item => {
        // Add safe access to potentially undefined properties
        const charges = item.charges?.data || []
        const charge = charges[0] || {}
        
        // Enhanced customer name retrieval
        let customerName = '';
        // Try to get name from charge billing details
        if (charge.billing_details?.name) {
          customerName = charge.billing_details.name;
        }
        // If not found, try to get from metadata
        else if (item.metadata?.customer_name) {
          customerName = item.metadata.customer_name;
        }
        // If still not found and we have a customer object, try to get from there
        else if (item.customer && typeof item.customer === 'string') {
          // Store the customer ID to fetch details later if needed
          customerName = `Customer ${item.customer}`; // Temporary fallback
        }
        
        return {
          id: item.id,
          customer_email: charge.billing_details?.email || item.metadata?.customer_email || '',
          customer_name: customerName,
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          payment_method: (item.payment_method_types && item.payment_method_types[0]) || 'unknown',
          created_at: new Date(item.created * 1000).toISOString(),
          metadata: item.metadata || {}
        }
      })

      console.log(`Transformed ${transformedData.length} transactions`)

      // Sync with Supabase
      for (const transaction of transformedData) {
        const { error: upsertError } = await supabaseAdmin
          .from('stripe_transactions')
          .upsert(transaction, {
            onConflict: 'id',
            ignoreDuplicates: false
          })

        if (upsertError) {
          console.error('Error syncing transaction:', upsertError)
        }
      }

      console.log('Successfully synced transactions with Supabase')

      // Return the transformed data
      return new Response(
        JSON.stringify(transformedData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError)
      throw new Error(`Stripe API error: ${stripeError.message}`)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Unauthorized') ? 403 : 500,
      }
    )
  }
}) 