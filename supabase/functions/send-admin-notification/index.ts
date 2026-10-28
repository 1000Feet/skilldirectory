// Edge Function with enhanced validation, rate limiting, and error handling
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Z\s-']{2,50}$/;
const ISSUE_TYPES = ["general", "bug", "feature", "account", "other"];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5;

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = (Deno.env.get('SB_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')) ?? '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validate request data
function validateRequestData(data: any) {
  const errors = [];

  // Validate first name
  if (!data.firstName || !NAME_REGEX.test(data.firstName)) {
    errors.push("Invalid first name format");
  }

  // Validate last name
  if (!data.lastName || !NAME_REGEX.test(data.lastName)) {
    errors.push("Invalid last name format");
  }

  // Validate email
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.push("Invalid email format");
  }

  // Validate issue type
  if (!data.issueType || !ISSUE_TYPES.includes(data.issueType)) {
    errors.push("Invalid issue type");
  }

  // Validate message
  if (!data.message || typeof data.message !== 'string' || 
      data.message.trim().length < 10 || data.message.length > 2000) {
    errors.push("Invalid message format or length");
  }

  return errors;
}

// Check rate limit for an email
async function checkRateLimit(email: string): Promise<boolean> {
  try {
    const { data: submissions, error } = await supabase
      .from('support_submissions')
      .select('created_at')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking rate limit:', error);
      return false; // Allow the request if we can't check the rate limit
    }

    return submissions && submissions.length < MAX_REQUESTS_PER_WINDOW;
  } catch (error) {
    console.error('Error in rate limit check:', error);
    return false;
  }
}

// Sanitize HTML content from message
function sanitizeMessage(message: string): string {
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

Deno.serve(async (req) => {
  // Log request details
  console.log(`${new Date().toISOString()} - Received ${req.method} request to ${req.url}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const rawBody = await req.text();
    let submissionData;
    
    try {
      submissionData = JSON.parse(rawBody);
    } catch (error) {
      console.error("JSON parsing error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request data
    const validationErrors = validateRequestData(submissionData);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const isWithinLimit = await checkRateLimit(submissionData.email);
    if (!isWithinLimit) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please wait before submitting another request." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and format data
    const sanitizedMessage = sanitizeMessage(submissionData.message);
    
    // Format email content with improved styling
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #fff; padding: 20px; border-radius: 5px; }
            .message { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Support Request</h2>
            </div>
            <div class="content">
              <p><strong>From:</strong> ${submissionData.firstName} ${submissionData.lastName}</p>
              <p><strong>Email:</strong> ${submissionData.email}</p>
              <p><strong>Issue Type:</strong> ${submissionData.issueType}</p>
              <p><strong>Message:</strong></p>
              <div class="message">
                ${sanitizedMessage.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Configure email options
    const emailOptions = {
      to: "maliktanveer2641@gmail.com",
      subject: `New Support Request: ${submissionData.issueType} - ${submissionData.firstName} ${submissionData.lastName}`,
      html: emailContent,
      from: "Skill Directory Support <no-reply@skilldirectory.com>"
    };

    // Log email details (for development/debugging)
    console.log("Preparing to send email with options:", JSON.stringify(emailOptions, null, 2));

    // Here you would implement the actual email sending logic
    // For now, we're just logging the attempt
    console.log("Email would be sent with content:", emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Support request received successfully"
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }
      }
    );

  } catch (error) {
    console.error("Error processing support request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
