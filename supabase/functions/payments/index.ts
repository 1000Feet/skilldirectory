// Payments & memberships for SkillDirectory: monthly Stripe subscriptions with automatic renewal.
// The browser never sees the Stripe secret key or decides prices. Renewals, failed payments and
// cancellations arrive through the `stripe-webhook` function.
import type Stripe from "npm:stripe@17";
import {
  adminClient, handler, HttpError, isMembershipType, json, requireUser, stripeClient,
} from "../_shared/server.ts";
import { getMembership, isPaidSubscription, priceIdFor, syncSubscription, writeMembership } from "../_shared/billing.ts";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
type Admin = ReturnType<typeof adminClient>;

async function findCoupon(stripe: Stripe, code: string) {
  try {
    return await stripe.coupons.retrieve(code);
  } catch {
    const list = await stripe.coupons.list({ limit: 100 });
    return list.data.find((c) => c.name?.toLowerCase() === code.toLowerCase()) ?? null;
  }
}

async function getEducator(admin: Admin, educatorId: string) {
  const { data } = await admin.from("educator_profiles").select("id, email, name, user_id").eq("id", educatorId).maybeSingle();
  if (!data) throw new HttpError(404, "Educator not found");
  return data;
}

async function requireOwner(req: Request, admin: Admin, educatorId: string) {
  const user = await requireUser(req, admin);
  const educator = await getEducator(admin, educatorId);
  if (educator.user_id !== user.id) throw new HttpError(403, "Not your profile");
  return educator;
}

// The educator's current Stripe subscription (if any, and if it exists in this Stripe mode).
async function currentSubscription(stripe: Stripe, membership: { metadata?: Record<string, unknown> } | null) {
  const id = membership?.metadata?.stripeSubscriptionId;
  if (typeof id !== "string") return null;
  try {
    return await stripe.subscriptions.retrieve(id);
  } catch {
    return null; // e.g. created with test keys and we are now live
  }
}

async function getOrCreateCustomer(
  stripe: Stripe,
  educator: { id: string; email: string | null; name: string | null },
  membership: { metadata?: Record<string, unknown> } | null,
) {
  const saved = membership?.metadata?.stripeCustomerId;
  if (typeof saved === "string") {
    try {
      const c = await stripe.customers.retrieve(saved);
      if (!("deleted" in c && c.deleted)) return c.id;
    } catch { /* not in this Stripe mode: create a new one */ }
  }
  const found = await stripe.customers.search({ query: `metadata['educatorId']:'${educator.id}'`, limit: 1 })
    .catch(() => ({ data: [] as Stripe.Customer[] }));
  if (found.data[0]) return found.data[0].id;
  const c = await stripe.customers.create({
    email: educator.email ?? undefined,
    name: educator.name ?? undefined,
    metadata: { educatorId: educator.id },
  });
  return c.id;
}

async function setBasic(admin: Admin, educatorId: string) {
  const now = new Date();
  await writeMembership(admin, educatorId, {
    type: "basic", status: "active", auto_renew: false, end_date: null,
    current_period_start: now.toISOString(),
    current_period_end: new Date(now.getTime() + DAYS_30).toISOString(),
  });
}

Deno.serve(handler(async (req, body) => {
  const admin = adminClient();
  const action = body.action === "create-payment-intent" ? "create-subscription" : body.action;

  switch (action) {
    // Right after sign-up (the user may not have a session yet because email confirmation is
    // required). It only CREATES a missing membership: basic = active, paid = inactive until paid.
    case "init-membership": {
      const educatorId = String(body.educatorId ?? "");
      const type = body.membershipType;
      if (!educatorId || !isMembershipType(type)) throw new HttpError(400, "Invalid request");
      await getEducator(admin, educatorId);
      const existing = await getMembership(admin, educatorId);
      if (!existing) {
        if (type === "basic") await setBasic(admin, educatorId);
        else {
          const now = new Date().toISOString();
          await writeMembership(admin, educatorId, {
            type, status: "inactive", auto_renew: true, current_period_start: now, current_period_end: now,
          });
        }
      }
      return json({ ok: true, created: !existing });
    }

    // Sign-up fallback when the DB trigger did not create the educator profile.
    case "ensure-educator-profile": {
      const userId = String(body.userId ?? "");
      const { data: u, error } = await admin.auth.admin.getUserById(userId);
      if (error || !u.user) throw new HttpError(404, "User not found");
      if (u.user.user_metadata?.user_type !== "educator") throw new HttpError(400, "Not an educator account");
      const { data: existing } = await admin.from("educator_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (existing) return json({ profile: existing });
      const email = u.user.email ?? "";
      const { data: profile, error: insErr } = await admin.from("educator_profiles").insert([{
        user_id: userId, email, name: String(body.name ?? "") || email.split("@")[0] || "Educator",
        is_active: true, description: null, image: null,
      }]).select().single();
      if (insErr) throw new HttpError(500, insErr.message);
      return json({ profile });
    }

    case "validate-coupon": {
      const code = String(body.code ?? "").trim();
      if (!code) return json({ valid: false, error: "Invalid coupon code. Please try another one." });
      const coupon = await findCoupon(stripeClient(), code);
      if (!coupon) return json({ valid: false, error: "Invalid coupon code. Please try another one." });
      if (!coupon.valid) return json({ valid: false, error: "This coupon code is no longer valid." });
      if (coupon.percent_off) return json({ valid: true, discount: { type: "percentage", value: coupon.percent_off }, couponId: coupon.id });
      if (coupon.amount_off) return json({ valid: true, discount: { type: "fixed", value: coupon.amount_off / 100 }, couponId: coupon.id });
      return json({ valid: false, error: "Invalid coupon format" });
    }

    // New monthly subscription. Returns the client secret of the first invoice's payment, which the
    // browser confirms with Stripe Elements. A 100% coupon activates the plan without payment.
    case "create-subscription": {
      const educatorId = String(body.educatorId ?? "");
      const type = body.membershipType;
      if (!educatorId || !isMembershipType(type) || type === "basic") throw new HttpError(400, "Invalid request");
      const stripe = stripeClient();
      const educator = await getEducator(admin, educatorId);
      const membership = await getMembership(admin, educatorId);

      const existing = await currentSubscription(stripe, membership);
      if (isPaidSubscription(existing)) {
        throw new HttpError(409, "You already have an active subscription: change plan from the Pricing page");
      }

      const customer = await getOrCreateCustomer(stripe, educator, membership);
      // Drop unfinished checkouts so a customer never ends up with two subscriptions.
      const pending = await stripe.subscriptions.list({ customer, status: "incomplete", limit: 10 });
      for (const s of pending.data) await stripe.subscriptions.cancel(s.id).catch(() => {});

      let coupon: Stripe.Coupon | null = null;
      if (typeof body.couponCode === "string" && body.couponCode.trim()) {
        coupon = await findCoupon(stripe, body.couponCode.trim());
        if (!coupon?.valid) coupon = null;
      }

      const sub = await stripe.subscriptions.create({
        customer,
        items: [{ price: await priceIdFor(stripe, type) }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
        metadata: { educatorId, membershipType: type },
        expand: ["latest_invoice.payment_intent"],
      });
      await writeMembership(admin, educatorId, {
        metadata: { stripeCustomerId: customer, stripeSubscriptionId: sub.id, stripeStatus: sub.status },
      });

      const invoice = sub.latest_invoice as Stripe.Invoice | null;
      const pi = invoice?.payment_intent as Stripe.PaymentIntent | null;
      if (!pi) {
        // Nothing to pay now (100% coupon): the subscription is already active.
        await syncSubscription(admin, sub);
        return json({ free: true, couponApplied: !!coupon });
      }
      return json({
        clientSecret: pi.client_secret,
        amount: invoice?.amount_due ?? pi.amount,
        couponApplied: !!coupon,
      });
    }

    // Called after the browser confirmed the first payment: verifies it with Stripe and activates
    // the plan right away (the webhook would do the same a few seconds later).
    case "activate-paid": {
      const piId = String(body.paymentIntentId ?? "");
      if (!piId.startsWith("pi_")) throw new HttpError(400, "Invalid payment");
      const stripe = stripeClient();
      const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["invoice"] });
      if (pi.status !== "succeeded") throw new HttpError(402, "Payment not completed");
      const invoice = pi.invoice as Stripe.Invoice | null;
      const subId = typeof invoice?.subscription === "string" ? invoice.subscription : invoice?.subscription?.id;
      if (!subId) throw new HttpError(400, "Payment is not a membership payment");
      const sub = await stripe.subscriptions.retrieve(subId);
      await syncSubscription(admin, sub);
      return json({ ok: true, educatorId: sub.metadata?.educatorId, membershipType: sub.metadata?.membershipType });
    }

    // Standard <-> Premium for an active subscriber: Stripe charges/credits the difference
    // (proration) on the saved card immediately.
    case "change-plan": {
      const educatorId = String(body.educatorId ?? "");
      const type = body.membershipType;
      if (!isMembershipType(type) || type === "basic") throw new HttpError(400, "Invalid request");
      await requireOwner(req, admin, educatorId);
      const stripe = stripeClient();
      const sub = await currentSubscription(stripe, await getMembership(admin, educatorId));
      if (!isPaidSubscription(sub)) return json({ needsCheckout: true });
      const updated = await stripe.subscriptions.update(sub!.id, {
        items: [{ id: sub!.items.data[0].id, price: await priceIdFor(stripe, type) }],
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
        cancel_at_period_end: false,
        metadata: { ...sub!.metadata, educatorId, membershipType: type },
      }).catch((e) => {
        throw new HttpError(402, e?.message ?? "The payment for the new plan failed");
      });
      await syncSubscription(admin, updated);
      return json({ ok: true, membershipType: type });
    }

    // Switch to the free plan. With an active subscription, it is cancelled at the end of the
    // period already paid (the webhook then moves the profile to Basic).
    case "set-basic": {
      const educatorId = String(body.educatorId ?? "");
      await requireOwner(req, admin, educatorId);
      const stripe = stripeClient();
      const sub = await currentSubscription(stripe, await getMembership(admin, educatorId));
      if (isPaidSubscription(sub)) {
        const updated = await stripe.subscriptions.update(sub!.id, { cancel_at_period_end: true });
        await syncSubscription(admin, updated);
        return json({ ok: true, scheduled: true, until: new Date(updated.current_period_end * 1000).toISOString() });
      }
      await setBasic(admin, educatorId);
      return json({ ok: true, scheduled: false });
    }

    // Undo a scheduled cancellation.
    case "resume-subscription": {
      const educatorId = String(body.educatorId ?? "");
      await requireOwner(req, admin, educatorId);
      const stripe = stripeClient();
      const sub = await currentSubscription(stripe, await getMembership(admin, educatorId));
      if (!isPaidSubscription(sub)) throw new HttpError(400, "No active subscription");
      const updated = await stripe.subscriptions.update(sub!.id, { cancel_at_period_end: false });
      await syncSubscription(admin, updated);
      return json({ ok: true });
    }

    default:
      throw new HttpError(400, "Unknown action");
  }
}));

