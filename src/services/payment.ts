import { MembershipType } from '@/lib/auth-types';
import { callEdge } from '@/integrations/supabase/edge';
import { MEMBERSHIP_PRODUCTS } from './payment-config';

// Activates the membership paid with `paymentIntentId`. Stripe is checked on the server.
export async function updateMembershipStatus(paymentIntentId: string) {
  try {
    await callEdge('payments', 'activate-paid', { paymentIntentId });
    return true;
  } catch (error) {
    console.error('Error in updateMembershipStatus:', error);
    // Return false but don't throw error to allow the payment flow to continue
    return false;
  }
}

// Get the amount in cents for a given membership type
export function getMembershipAmount(membershipType: MembershipType): number {
  return MEMBERSHIP_PRODUCTS[membershipType]?.amount || 0;
}
