import { MembershipType } from '@/lib/auth-types';

interface CreatePaymentSessionParams {
  membershipType: MembershipType;
  profileId?: string;
  couponCode?: string;
}

// This is a mock implementation that returns a fake client secret
// for testing purposes until the backend is ready
export async function mockCreatePaymentSession({
  membershipType,
  profileId,
  couponCode
}: CreatePaymentSessionParams): Promise<{ clientSecret: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real implementation, this would communicate with Stripe
  // to create a payment intent with the correct amount and coupon
  
  // Return a fake client secret for testing
  // Format: _secret_mockintent_XXXXXX where XXXXXX includes identifiers for testing
  const mockSecret = `_secret_mockintent_${Date.now()}_${membershipType}_${couponCode || 'nocoupon'}`;
  
  return {
    clientSecret: mockSecret
  };
}
