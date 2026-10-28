// Stripe subscriptions <-> `memberships` table. Used by the `payments` function (immediate feedback
// after checkout) and by `stripe-webhook` (renewals, failed payments, cancellations).
import type Stripe from "npm:stripe@17";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError, isMembershipType, MEMBERSHIP_PRODUCTS, MembershipType } from "./server.ts";

const priceCache = new Map<string, string>();

// Recurring monthly price for a paid plan, found by lookup_key (works the same in test and live).
export async function priceIdFor(stripe: Stripe, type: MembershipType): Promise<string> {
  const lookupKey = MEMBERSHIP_PRODUCTS[type].lookupKey;
  if (!lookupKey) throw new HttpError(400, "This plan is free");
  const cached = priceCache.get(lookupKey);
  if (cached) return cached;
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (!data[0]) throw new HttpError(500, `Stripe price "${lookupKey}" not found`);
  priceCache.set(lookupKey, data[0].id);
  return data[0].id;
}

// Subscription statuses that keep the paid plan active. `past_due` keeps it while Stripe retries
// the card (Smart Retries); when Stripe gives up the subscription becomes canceled/unpaid.
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

// deno-lint-ignore no-explicit-any
export async function getMembership(admin: SupabaseClient, educatorId: string): Promise<any | null> {
  const { data } = await admin.from("memberships").select("*").eq("educator_id", educatorId).maybeSingle();
  return data;
}

export async function writeMembership(
  admin: SupabaseClient,
  educatorId: string,
  fields: Record<string, unknown>,
) {
  const existing = await getMembership(admin, educatorId);
  const metadata = { ...(existing?.metadata ?? {}), ...((fields.metadata as object) ?? {}) };
  const row = { ...fields, metadata, updated_at: new Date().toISOString() };
  if (existing) {
    const { error } = await admin.from("memberships").update(row).eq("educator_id", educatorId);
    if (error) throw new HttpError(500, error.message);
  } else {
    const now = new Date().toISOString();
    const { error } = await admin.from("memberships").insert([{
      educator_id: educatorId, start_date: now, type: "basic", status: "active",
      current_period_start: now, current_period_end: now, ...row,
    }]);
    if (error) throw new HttpError(500, error.message);
  }
}

const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

// Mirrors a Stripe subscription onto the educator's membership row.
export async function syncSubscription(admin: SupabaseClient, sub: Stripe.Subscription) {
  const educatorId = sub.metadata?.educatorId;
  if (!educatorId) {
    console.warn("Subscription without educatorId metadata", sub.id);
    return;
  }
  const existing = await getMembership(admin, educatorId);
  // Ignore events for an older subscription once the educator has moved to a newer one.
  const currentSubId = existing?.metadata?.stripeSubscriptionId;
  if (currentSubId && currentSubId !== sub.id && sub.status !== "active") return;

  const metaType = sub.metadata?.membershipType;
  const type: MembershipType = isMembershipType(metaType) ? metaType : "standard";
  const stripeMeta = {
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    stripeStatus: sub.status,
    priceId: sub.items.data[0]?.price?.id ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    livemode: sub.livemode,
  };

  if (sub.status === "incomplete") return; // checkout not finished yet: nothing to change

  if (PAID_STATUSES.has(sub.status)) {
    await writeMembership(admin, educatorId, {
      type,
      status: "active",
      current_period_start: iso(sub.current_period_start),
      current_period_end: iso(sub.current_period_end),
      end_date: sub.cancel_at_period_end ? iso(sub.current_period_end) : null,
      auto_renew: !sub.cancel_at_period_end,
      metadata: stripeMeta,
    });
    return;
  }

  // canceled / unpaid / incomplete_expired / paused: back to the free plan (profile stays listed).
  await writeMembership(admin, educatorId, {
    type: "basic",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    auto_renew: false,
    metadata: { ...stripeMeta, endedPlan: type, endedAt: new Date().toISOString() },
  });
}

export function isPaidSubscription(sub: Stripe.Subscription | null | undefined) {
  return !!sub && PAID_STATUSES.has(sub.status);
}
