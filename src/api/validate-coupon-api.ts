import { callEdge } from '@/integrations/supabase/edge';

export async function validateCouponCode(code: string): Promise<{
  valid: boolean;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  error?: string;
  couponId?: string;
}> {
  try {
    return await callEdge('payments', 'validate-coupon', { code: code.trim() });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon. Please try again.' };
  }
}
