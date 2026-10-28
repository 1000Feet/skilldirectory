// Stripe webhook: keeps `memberships` in sync with subscriptions (monthly renewals, failed payments,
// plan changes, cancellations).
//
// Authenticity: the request body is NOT trusted. We only read the event id from it and fetch the
// event again from the Stripe API with our secret key, so a forged request cannot change anything.
// (When STRIPE_WEBHOOK_SECRET matches the endpoint, the signature is verified too.)
import Stripe from "npm:stripe@17";
import { adminClient, json, stripeClient } from "../_shared/server.ts";
import { syncSubscription } from "../_shared/billing.ts";

const HANDLED = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const raw = await req.text();
  const stripe = stripeClient();

  let eventId: string | undefined;
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (secret && signature) {
    try {
      const ev = await stripe.webhooks.constructEventAsync(
        raw, signature, secret, undefined, Stripe.createSubtleCryptoProvider(),
      );
      eventId = ev.id;
    } catch {
      // Signature secret not set for this endpoint yet: fall back to fetching the event below.
    }
  }
  if (!eventId) {
    try {
      eventId = JSON.parse(raw)?.id;
    } catch { /* ignore */ }
  }
  if (typeof eventId !== "string" || !eventId.startsWith("evt_")) return json({ error: "Bad request" }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe.events.retrieve(eventId); // the only source of truth
  } catch {
    return json({ error: "Unknown event" }, 400);
  }
  if (!HANDLED.has(event.type)) return json({ received: true, ignored: event.type });

  const admin = adminClient();
  try {
    let sub: Stripe.Subscription | null = null;
    if (event.type.startsWith("customer.subscription.")) {
      // Re-read the subscription so out-of-order events always apply the latest state.
      const id = (event.data.object as Stripe.Subscription).id;
      sub = await stripe.subscriptions.retrieve(id);
    } else {
      const invoice = event.data.object as Stripe.Invoice;
      const id = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
      if (id) sub = await stripe.subscriptions.retrieve(id);
    }
    if (sub) await syncSubscription(admin, sub);
    return json({ received: true });
  } catch (e) {
    console.error("stripe-webhook", event.type, e instanceof Error ? e.message : e);
    return json({ error: "Processing failed" }, 500); // Stripe retries
  }
});
