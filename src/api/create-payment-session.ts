import { env } from '@/config/env';
import { MembershipType } from '@/lib/auth-types';
import { mockCreatePaymentSession } from './mock-create-payment-session';

interface CreatePaymentSessionParams {
  membershipType: MembershipType;
  profileId?: string;
  couponCode?: string;
}

export async function createPaymentSession({
  membershipType,
  profileId,
  couponCode
}: CreatePaymentSessionParams): Promise<{ clientSecret: string }> {
  try {
    // Use mock implementation for testing
    return await mockCreatePaymentSession({
      membershipType,
      profileId,
      couponCode
    });
    
    // When backend is ready, uncomment this code:
    /*
    const response = await fetch(`${env.apiUrl}/create-payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        membershipType,
        profileId,
        couponCode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment session');
    }

    return await response.json();
    */
  } catch (error) {
    console.error('Error creating payment session:', error);
    throw new Error('Failed to create payment session');
  }
}
