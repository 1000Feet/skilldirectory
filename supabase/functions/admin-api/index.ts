// Admin-only operations for SkillDirectory. Every action requires a signed-in user
// listed in public.admin_users. Replaces the service_role client used in the browser.
import { adminClient, handler, HttpError, json, requireAdmin, stripeClient } from "../_shared/server.ts";

const profileTable = (t: unknown) => {
  if (t === "educator") return "educator_profiles";
  if (t === "student") return "student_profiles";
  throw new HttpError(400, "Invalid user type");
};

Deno.serve(handler(async (req, body) => {
  const admin = adminClient();
  await requireAdmin(req, admin);

  switch (body.action) {
    case "list-memberships": {
      const { data, error } = await admin.from("memberships")
        .select("*, educator_profiles!memberships_educator_id_fkey ( name, email )")
        .order("updated_at", { ascending: false });
      if (error) throw new HttpError(500, error.message);
      return json({ data });
    }

    case "toggle-user": {
      const table = profileTable(body.userType);
      const { error } = await admin.from(table).update({ is_active: !!body.isActive }).eq("user_id", String(body.userId));
      if (error) throw new HttpError(500, error.message);
      return json({ ok: true });
    }

    case "delete-user": {
      const userId = String(body.userId ?? "");
      const table = profileTable(body.userType);
      if (!userId) throw new HttpError(400, "Missing userId");
      await admin.from(table).update({
        is_active: false, deleted_at: new Date().toISOString(), email: `deleted-${userId}@deleted.account`,
      }).eq("user_id", userId);
      if (body.userType === "educator") {
        await Promise.allSettled(["courses", "featured_educators", "memberships", "educator_categories", "educator_fields"]
          .map((t) => admin.from(t).delete().eq("educator_id", userId)));
      } else {
        await Promise.allSettled(["enrollments", "student_progress"]
          .map((t) => admin.from(t).delete().eq("student_id", userId)));
      }
      const { error: authError } = await admin.auth.admin.deleteUser(userId);
      if (authError) {
        await admin.auth.admin.updateUserById(userId, {
          email: `deleted-${userId}@deleted.account`,
          app_metadata: { disabled: true, deleted: true },
          user_metadata: { status: "deleted" },
        }).catch(() => {});
      }
      await admin.from(table).delete().eq("user_id", userId);
      return json({ ok: true });
    }

    case "list-support": {
      const { data, error } = await admin.from("support_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw new HttpError(500, error.message);
      return json({ data });
    }

    case "delete-support": {
      const { error } = await admin.from("support_submissions").delete().eq("id", String(body.id));
      if (error) throw new HttpError(500, error.message);
      return json({ ok: true });
    }

    case "list-coupons": {
      const coupons = await stripeClient().coupons.list();
      return json({ data: coupons.data });
    }

    case "create-coupon": {
      const duration = body.duration as "once" | "repeating" | "forever";
      const coupon = await stripeClient().coupons.create({
        name: String(body.name ?? ""),
        percent_off: Number(body.percent_off),
        duration,
        duration_in_months: duration === "repeating" ? Number(body.duration_in_months) : undefined,
      });
      return json({ data: coupon });
    }

    case "delete-coupon": {
      const deleted = await stripeClient().coupons.del(String(body.couponId));
      return json({ data: deleted });
    }

    case "coupon-usage": {
      const couponId = String(body.couponId ?? "").replace(/'/g, "");
      const stripe = stripeClient();
      const pis = await stripe.paymentIntents.search({ query: `metadata['couponCode']:'${couponId}'`, limit: 100 });
      const usage = [];
      for (const pi of pis.data) {
        const customerId = pi.customer ? (typeof pi.customer === "string" ? pi.customer : pi.customer.id) : "unknown";
        const row = {
          id: pi.id,
          customer: { id: customerId, email: pi.metadata.email || undefined, name: undefined as string | undefined },
          created: pi.created,
          amount_off: pi.metadata.originalAmount && pi.metadata.discountedAmount
            ? parseInt(pi.metadata.originalAmount) - parseInt(pi.metadata.discountedAmount) : 0,
          payment_intent_id: pi.id,
        };
        if (pi.customer) {
          try {
            const c = await stripe.customers.retrieve(customerId);
            if (!("deleted" in c && c.deleted)) {
              row.customer.name = c.name ?? undefined;
              row.customer.email = row.customer.email ?? c.email ?? undefined;
            }
          } catch { /* keep basic info */ }
        }
        usage.push(row);
      }
      return json({ data: usage });
    }

    default:
      throw new HttpError(400, "Unknown action");
  }
}));
