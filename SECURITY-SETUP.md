# SkillDirectory — security setup (2026-10-28)

This branch is the full site that was live on skilldirectory.com (source: branch `v8`, June 2025),
cleaned up so that **no secret ever reaches the browser**.

## What changed
- The browser uses only public keys: `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`.
- All privileged work moved to Edge Functions:
  - `payments` — payment intents, coupon validation, membership creation/activation
    (paid plans are activated only after Stripe confirms the payment).
  - `admin-api` — admin panel: memberships list, user activation/deletion, support submissions, coupons.
  - `gemini-proxy` — AI assistant on educator profiles (prompt built server-side).
- Removed: service_role client in the browser, Stripe secret key in the browser, `public/config.js`,
  `public/env-config.js`, `.env.production`, dead `src/pages/api` and `src/app` code, migrations that
  stored the Gemini key in the public `api_keys` table.
- `vite.config.ts`: no longer injects the whole build environment into the bundle; assets use base `/`;
  no public source maps.
- `src/utils/environment.ts`: no dynamic `import.meta.env[key]` (it embedded every VITE_ variable).

## Edge Function secrets to set
| Secret | Value |
|---|---|
| `STRIPE_SECRET_KEY` | new Stripe secret key (after "Roll key") |
| `GEMINI_API_KEY` | new Google AI Studio key |
| `RESEND_API_KEY` | new Resend key (used by `send-support-email`) |
| `SB_SECRET_KEY` | Supabase **secret** key (`sb_secret_…`) — only on Supabase; Lovable Cloud injects its own |

`SUPABASE_URL` is provided automatically.

## Database
Apply `supabase/migrations/20261028_lock_down_api_keys.sql` (removes public read access to `api_keys`).

## Never do again
Do not put secrets in `VITE_*` variables or in `public/` files: everything there is public.
