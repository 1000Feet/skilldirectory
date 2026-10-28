import { MembershipType } from '@/lib/auth-types';
import { callEdge } from '@/integrations/supabase/edge';

// Memberships are changed only by the `payments` Edge Function:
// - basic (free): the signed-in owner can switch to it; an active subscription is cancelled at the
//   end of the period already paid (`scheduled: true`, `until` = last day of the paid plan);
// - paid plans: activated only after Stripe confirms the payment (paymentIntentId).
export async function updateMembership(
  educatorId: string,
  membershipType: MembershipType,
  paymentIntentId?: string
): Promise<{ scheduled?: boolean; until?: string }> {
  if (membershipType === 'basic') {
    return callEdge<{ scheduled?: boolean; until?: string }>('payments', 'set-basic', { educatorId });
  }
  if (!paymentIntentId) {
    throw new Error('A completed payment is required to activate this plan');
  }
  await callEdge('payments', 'activate-paid', { paymentIntentId });
  return {};
}
