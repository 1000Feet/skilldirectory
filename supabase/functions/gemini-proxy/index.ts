// AI assistant on educator profiles. The Gemini key stays on the server (GEMINI_API_KEY secret)
// and the prompt context is built here from the educator profile, so the endpoint cannot be
// used as a free general-purpose LLM proxy.
import { adminClient, handler, HttpError, json } from "../_shared/server.ts";

// Model can be overridden with the GEMINI_MODEL secret. Google retires models over time
// (gemini-2.0-flash was retired in 2026), so we fall back through a short list on 404.
const MODELS = [Deno.env.get("GEMINI_MODEL"), "gemini-3.8-flash", "gemini-flash-latest"].filter(Boolean) as string[];
const modelUrl = (m: string) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;

// deno-lint-ignore no-explicit-any
function buildContext(p: any): string {
  const contact = [
    p.phone && `Phone: ${p.phone}`, p.email && `Email: ${p.email}`,
    p.website && `Website: ${p.website}`, p.address && `Address: ${p.address}`,
  ].filter(Boolean).join("\n");
  const social = [p.facebook_url && `Facebook: ${p.facebook_url}`, p.instagram_url && `Instagram: ${p.instagram_url}`]
    .filter(Boolean).join("\n") || "No social media links available";
  return `
      You are Skill Directory, the AI assistant for ${p.name}, an educator on the 1000Feet platform.

      EDUCATOR PROFILE:
      Business Name: ${p.name}
      Description: ${p.description || "Not provided"}
      Categories: ${Array.isArray(p.categories) ? p.categories.join(", ") : "Not specified"}

      CONTACT INFORMATION:
      ${contact}

      SOCIAL MEDIA:
      ${social}

      ABOUT THE BUSINESS:
      ${p.about_business || "Not provided"}

      ADDITIONAL KNOWLEDGE BASE:
      ${p.ai_chatbot || ""}

      CONVERSATION GUIDELINES:
      1. You are Skill Directory, a friendly and professional AI assistant
      2. Provide natural, conversational responses
      3. For contact inquiries: share relevant contact details from the profile, formatted clearly
      4. For business inquiries: focus on the educator's specific services, categories and description
      5. For location questions: share the address if available
      6. For website/social media: share available links and platforms
      7. If information is not available: acknowledge it and suggest alternative ways to get it
      8. Stay focused on educational services
      9. Be helpful but maintain professional boundaries
      10. If asked about unrelated topics: politely redirect to educational services

      Remember: You are representing ${p.name}'s educational business. Keep responses relevant, professional, and focused on their services.
    `;
}

Deno.serve(handler(async (_req, body) => {
  const message = String(body.message ?? "").slice(0, 2000);
  const educatorId = String(body.educatorId ?? "");
  if (!message || !educatorId) throw new HttpError(400, "Invalid request");

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new HttpError(500, "AI assistant is not configured");

  const { data: profile } = await adminClient().from("educator_profiles").select("*").eq("id", educatorId).maybeSingle();
  if (!profile) throw new HttpError(404, "Educator not found");

  const payload = JSON.stringify({ contents: [{ parts: [{ text: buildContext(profile) }, { text: message }] }] });
  let res: Response | null = null;
  for (const model of MODELS) {
    res = await fetch(modelUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: payload,
    });
    if (res.status !== 404) break;
    console.error("Gemini model not available:", model);
  }
  if (!res || !res.ok) {
    console.error("Gemini error", res?.status, await res?.text());
    throw new HttpError(502, "AI assistant unavailable");
  }
  const data = await res.json();
  return json({ text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "" });
}));
