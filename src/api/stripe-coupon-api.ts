import { callEdge } from '@/integrations/supabase/edge';

// Admin coupon management, executed by the `admin-api` Edge Function (admin users only).

export interface CouponResponse {
  id: string;
  name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: string;
  duration_in_months: number | null;
  valid: boolean;
  times_redeemed: number;
  created: number;
}

export interface CouponUsage {
  id: string;
  customer: {
    id: string;
    name?: string;
    email?: string;
  };
  created: number;
  amount_off: number;
  payment_intent_id?: string;
  invoice_id?: string;
}

export async function listCoupons(): Promise<{ data: CouponResponse[] }> {
  return callEdge('admin-api', 'list-coupons');
}

export async function createCoupon(params: {
  name: string;
  percent_off: number;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months?: number;
}): Promise<CouponResponse> {
  const res = await callEdge<{ data: CouponResponse }>('admin-api', 'create-coupon', params);
  return res.data;
}

export async function deleteCoupon(couponId: string): Promise<{ deleted: boolean }> {
  const res = await callEdge<{ data: { deleted: boolean } }>('admin-api', 'delete-coupon', { couponId });
  return res.data;
}

export async function getCouponUsage(couponId: string): Promise<CouponUsage[]> {
  const res = await callEdge<{ data: CouponUsage[] }>('admin-api', 'coupon-usage', { couponId });
  return res.data;
}
