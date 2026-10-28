// Payments & memberships for SkillDirectory.
// Replaces the browser-side Stripe secret key and service_role usage.
import {
  adminClient, handler, HttpError, isMembershipType, json,
  MEMBERSHIP_PRODUCTS, MembershipType, requireUser, stripeClient,
} from "../_shared/server.ts";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

async function findCoupon(stripe: ReturnType<typeof stripeClient>, code: string) {
  try {
    return await stripe.coupons.retrieve(code);
  } catch {
    const list = await stripe.coupons.list({ limit: 100 });
    return list.data.find((c) => c.name?.toLowerCase() === code.toLowerCase()) ?? null;
  }
}

async function educatorExists(admin: ReturnType<typeof adminClient>, educatorId: string) {
  const { data } = await admin.from("educator_profiles").select("id, email, user_id").eq("id", educatorId).maybeSingle();
  return data;
}

async function upsertMembership(
  admin: ReturnType<typeof adminClient>,
  educatorId: string,
  type: MembershipType,
  status: "active" | "inactive",
  extraMetadata: Record<string, unknown> = {},
) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + DAYS_30);
  const { data: existing } = await admin.from("memberships").select("*").eq("educator_id", educatorId).maybeSingle();
  const metadata = { ...(existing?.metadata ?? {}), priceId: MEMBERSHIP_PRODUCTS[type].priceId, ...extraMetadata };
  if (!existing) {
    const { error } = await admin.from("memberships").insert([{
      educator_id: educatorId, type, status,
      start_date: now.toISOString(), current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(), auto_renew: true, metadata,
    }]);
    if (error) throw new HttpError(500, error.message);
  } else {
    const { error } = await admin.from("memberships").update({
      type, status, updated_at: now.toISOString(),
      current_period_start: now.toISOString(), current_period_end: periodEnd.toISOString(), metadata,
    }).eq("educator_id", educatorId);
    if (error) throw new HttpError(500, error.message);
  }
}

Deno.serve(handler(async (req, body) => {
  const admin = adminClient();
  const action = body.action;

  switch (action) {
    // Called right after sign-up (the user may not have a session yet because email
    // confirmation is required). It can only CREATE a missing membership: basic becomes
    // active, paid plans stay inactive until a verified payment activates them.
    case "init-membership": {
      const educatorId = String(body.educatorId ?? "");
      const type = body.membershipType;
      if (!educatorId || !isMembershipType(type)) throw new HttpError(400, "Invalid request");
      if (!(await educatorExists(admin, educatorId))) throw new HttpError(404, "Educator not found");
      const { data: existing } = await admin.from("memberships").select("id").eq("educator_id", educatorId).maybeSingle();
      if (!existing) await upsertMembership(admin, educatorId, type, type === "basic" ? "active" : "inactive");
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

    case "create-payment-intent": {
      const educatorId = String(body.educatorId ?? "");
      const type = body.membershipType;
      if (!educatorId || !isMembershipType(type)) throw new HttpError(400, "Invalid request");
      const educator = await educatorExists(admin, educatorId);
      if (!educator) throw new HttpError(404, "Educator not found");
      const originalAmount = MEMBERSHIP_PRODUCTS[type].amount;
      if (originalAmount === 0) return json({ free: true });

      const stripe = stripeClient();
      let amount: number = originalAmount;
      let coupon = null;
      if (typeof body.couponCode === "string" && body.couponCode.trim()) {
        coupon = await findCoupon(stripe, body.couponCode.trim());
        if (coupon?.valid) {
          if (coupon.percent_off) amount = Math.round(amount * (1 - coupon.percent_off / 100));
          else if (coupon.amount_off) amount = Math.max(0, amount - coupon.amount_off);
        } else coupon = null;
      }
      if (amount === 0) {
        // 100% coupon: nothing to charge, activate directly.
        await upsertMembership(admin, educatorId, type, "active", { couponCode: coupon?.id ?? "" });
        return json({ free: true, couponApplied: !!coupon });
      }
      const pi = await stripe.paymentIntents.create({
        amount, currency: "usd", automatic_payment_methods: { enabled: true },
        metadata: {
          membershipType: type, educatorId, email: educator.email ?? "",
          priceId: MEMBERSHIP_PRODUCTS[type].priceId, couponCode: coupon?.id ?? "",
          originalAmount: String(originalAmount), discountedAmount: String(amount),
          discountAmount: String(originalAmount - amount),
        },
      });
      if (coupon && educator.email) {
        try {
          const customers = await stripe.customers.list({ email: educator.email, limit: 1 });
          if (customers.data[0]) {
            await stripe.promotionCodes.create({
              coupon: coupon.id, customer: customers.data[0].id,
              metadata: { paymentIntent: pi.id, educatorId },
            });
          }
        } catch (e) { console.error("coupon tracking failed", e); }
      }
      return json({ clientSecret: pi.client_secret, amount, originalAmount, couponApplied: !!coupon });
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

    // Activates a paid membership only after Stripe confirms the payment succeeded.
    case "activate-paid": {
      const piId = String(body.paymentIntentId ?? "");
      if (!piId.startsWith("pi_")) throw new HttpError(400, "Invalid payment");
      const pi = await stripeClient().paymentIntents.retrieve(piId);
      if (pi.status !== "succeeded") throw new HttpError(402, "Payment not completed");
      const educatorId = pi.metadata?.educatorId;
      const type = pi.metadata?.membershipType;
      if (!educatorId || !isMembershipType(type)) throw new HttpError(400, "Payment is not a membership payment");
      await upsertMembership(admin, educatorId, type, "active", { paymentIntentId: pi.id, couponCode: pi.metadata?.couponCode ?? "" });
      return json({ ok: true, educatorId, membershipType: type });
    }

    // Downgrade to the free plan: only the profile owner can do it.
    case "set-basic": {
      const user = await requireUser(req, admin);
      const educatorId = String(body.educatorId ?? "");
      const educator = await educatorExists(admin, educatorId);
      if (!educator || educator.user_id !== user.id) throw new HttpError(403, "Not your profile");
      await upsertMembership(admin, educatorId, "basic", "active");
      return json({ ok: true });
    }

    default:
      throw new HttpError(400, "Unknown action");
  }
}));
