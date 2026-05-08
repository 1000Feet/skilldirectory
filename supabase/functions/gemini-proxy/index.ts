import { corsHeaders } from '@supabase/supabase-js/cors';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const formatSocialLinks = (profile: any) => {
  const links: string[] = [];
  if (profile.facebook_url) links.push(`Facebook: ${profile.facebook_url}`);
  if (profile.instagram_url) links.push(`Instagram: ${profile.instagram_url}`);
  return links.length > 0 ? links.join('\n') : 'No social media links available';
};

const formatContactInfo = (profile: any) => {
  const info: string[] = [];
  if (profile.phone) info.push(`Phone: ${profile.phone}`);
  if (profile.email) info.push(`Email: ${profile.email}`);
  if (profile.website) info.push(`Website: ${profile.website}`);
  if (profile.address) info.push(`Address: ${profile.address}`);
  return info.join('\n');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, profile } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeProfile = profile || {};
    const context = `
      You are Skill Directory, the AI assistant for ${safeProfile.name || 'this educator'}, an educator on the 1000Feet platform.

      EDUCATOR PROFILE:
      Business Name: ${safeProfile.name || 'Not provided'}
      Description: ${safeProfile.description || 'Not provided'}
      Categories: ${safeProfile.categories?.join(', ') || 'Not specified'}

      CONTACT INFORMATION:
      ${formatContactInfo(safeProfile)}

      SOCIAL MEDIA:
      ${formatSocialLinks(safeProfile)}

      ABOUT THE BUSINESS:
      ${safeProfile.about_business || 'Not provided'}

      ADDITIONAL KNOWLEDGE BASE:
      ${safeProfile.ai_chatbot || ''}

      CONVERSATION GUIDELINES:
      1. You are Skill Directory, a friendly and professional AI assistant
      2. Provide natural, conversational responses
      3. Share relevant contact details from the profile when asked
      4. Focus on the educator's specific services and expertise
      5. If information is not available, acknowledge it and suggest alternatives
      6. Stay focused on educational services
      7. Politely redirect unrelated topics back to educational services

      Remember: You are representing ${safeProfile.name || 'the educator'}'s educational business.
    `;

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: context },
            { text: message }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return new Response(JSON.stringify({ error: 'Gemini API error', status: response.status }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('gemini-proxy error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
