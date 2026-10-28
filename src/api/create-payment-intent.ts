import { MembershipType } from '@/lib/auth-types';
import { callEdge } from '@/integrations/supabase/edge';

// Monthly subscriptions are created by the `payments` Edge Function: the Stripe secret key and the
// prices never reach the browser. Returns `free: true` when nothing has to be paid now
// (e.g. 100% coupon), otherwise the client secret of the first payment.
export async function createSubscription(options: {
  membershipType: MembershipType;
  educatorId: string;
  couponCode?: string;
}): Promise<{ free: true } | { free: false; clientSecret: string; amount: number }> {
  if (options.membershipType === 'basic') return { free: true };
  const res = await callEdge<{ free?: boolean; clientSecret?: string; amount?: number }>(
    'payments', 'create-subscription', options
  );
  if (res.free || !res.clientSecret) return { free: true };
  return { free: false, clientSecret: res.clientSecret, amount: res.amount ?? 0 };
}

// Standard <-> Premium for an existing subscriber (charged on the saved card).
export async function changePlan(educatorId: string, membershipType: MembershipType) {
  return callEdge<{ ok?: boolean; needsCheckout?: boolean }>('payments', 'change-plan', { educatorId, membershipType });
}
