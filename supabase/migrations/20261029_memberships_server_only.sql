-- Memberships are written only by Edge Functions (payments, stripe-webhook, admin-api), which use the
-- server key and bypass RLS. Before this, a signed-in educator could insert/update their own row from
-- the browser and give themselves Premium without paying.
drop policy if exists "Users can insert their own memberships" on public.memberships;
drop policy if exists "Users can update their own memberships" on public.memberships;
-- Kept: "Users can view their own memberships" (SELECT) and "Service role can manage all memberships".
