// Shared helpers for SkillDirectory Edge Functions.
// Secrets live ONLY here (server side), never in the browser bundle.
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Server-side Supabase client with elevated privileges.
// Works on Supabase (new sb_secret_ key set as SB_SECRET_KEY) and on Lovable Cloud
// (which injects SUPABASE_SERVICE_ROLE_KEY automatically).
export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new HttpError(500, "Server is missing Supabase credentials");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Returns the authenticated caller, or null when the request has no valid user session.
export async function getCaller(req: Request, admin: SupabaseClient) {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token.startsWith("sb_publishable_")) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser(req: Request, admin: SupabaseClient) {
  const user = await getCaller(req, admin);
  if (!user) throw new HttpError(401, "Authentication required");
  return user;
}

export async function requireAdmin(req: Request, admin: SupabaseClient) {
  const user = await requireUser(req, admin);
  const { data } = await admin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) throw new HttpError(403, "Admin access required");
  return user;
}

export function stripeClient(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new HttpError(500, "Stripe is not configured");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

// Single source of truth for plans: amounts are decided by Stripe prices, never by the browser.
// Prices are found by `lookup_key`, so the same code works with test and live keys
// (create one recurring monthly price per paid plan with these lookup keys in each mode).
export const MEMBERSHIP_PRODUCTS = {
  basic: { amount: 0, lookupKey: null },
  standard: { amount: 1900, lookupKey: "skilldirectory_standard_monthly" },
  premium: { amount: 4900, lookupKey: "skilldirectory_premium_monthly" },
} as const;
export type MembershipType = keyof typeof MEMBERSHIP_PRODUCTS;

export function isMembershipType(v: unknown): v is MembershipType {
  return typeof v === "string" && v in MEMBERSHIP_PRODUCTS;
}

export function handler(fn: (req: Request, body: Record<string, unknown>) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    try {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      return await fn(req, body);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const message = e instanceof Error ? e.message : "Unexpected error";
      console.error(message);
      return json({ error: message }, status);
    }
  };
}
