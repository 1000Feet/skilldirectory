import { MembershipType } from '@/lib/auth-types';
import { callEdge } from '@/integrations/supabase/edge';

// Payment intents are created by the `payments` Edge Function: the Stripe secret key and the
// prices never reach the browser.
export async function createPaymentIntent(membershipType: MembershipType, educatorId: string): Promise<string | null>;
export async function createPaymentIntent(options: {
  membershipType: MembershipType;
  educatorId: string;
  couponCode?: string;
}): Promise<{
  clientSecret: string;
  amount: number;
  originalAmount: number;
  couponApplied: boolean;
} | null>;

export async function createPaymentIntent(
  membershipTypeOrOptions: MembershipType | { membershipType: MembershipType; educatorId: string; couponCode?: string },
  educatorId?: string
) {
  const legacy = typeof membershipTypeOrOptions === 'string';
  const membershipType = legacy ? membershipTypeOrOptions : membershipTypeOrOptions.membershipType;
  const actualEducatorId = legacy ? educatorId : membershipTypeOrOptions.educatorId;
  const couponCode = legacy ? undefined : membershipTypeOrOptions.couponCode;

  if (!actualEducatorId) throw new Error('Educator ID is required');
  if (membershipType === 'basic') return null;

  const res = await callEdge<{ free?: boolean; clientSecret?: string; amount?: number; originalAmount?: number; couponApplied?: boolean }>(
    'payments', 'create-payment-intent', { membershipType, educatorId: actualEducatorId, couponCode }
  );
  if (res.free || !res.clientSecret) return null;

  if (legacy) return res.clientSecret;
  return {
    clientSecret: res.clientSecret,
    amount: res.amount ?? 0,
    originalAmount: res.originalAmount ?? 0,
    couponApplied: !!res.couponApplied,
  };
}
