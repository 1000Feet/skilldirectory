import { MembershipType } from '@/lib/auth-types';
import { callEdge } from '@/integrations/supabase/edge';

// Memberships are changed only by the `payments` Edge Function:
// - basic (free): the signed-in owner of the profile can switch to it;
// - paid plans: activated only after Stripe confirms the payment (paymentIntentId).
export async function updateMembership(
  educatorId: string,
  membershipType: MembershipType,
  paymentIntentId?: string
) {
  if (membershipType === 'basic') {
    await callEdge('payments', 'set-basic', { educatorId });
    return true;
  }
  if (!paymentIntentId) {
    throw new Error('A completed payment is required to activate this plan');
  }
  await callEdge('payments', 'activate-paid', { paymentIntentId });
  return true;
}
