-- Security fix (2026-10-28): api_keys was readable by anyone through the public key and
-- exposed the Gemini and Resend keys. Third-party secrets now live in Edge Function
-- secrets (GEMINI_API_KEY, RESEND_API_KEY, STRIPE_SECRET_KEY), not in tables.
drop policy if exists "Allow public read access" on public.api_keys;
alter table if exists public.api_keys enable row level security;
revoke all on public.api_keys from anon, authenticated;
delete from public.api_keys where key in ('gemini_api_key', 'resend');
