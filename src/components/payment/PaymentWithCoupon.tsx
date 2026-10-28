import { useEffect, useState } from 'react';
import { CheckoutForm } from './CheckoutForm';
import { createPaymentSession } from '@/api/create-payment-session';
import { MembershipType } from '@/lib/auth-types';
import { StripeProvider } from '@/providers/StripeProvider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PaymentWithCouponProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  profileId?: string;
  membershipType: MembershipType;
}

export function PaymentWithCoupon({
  onSuccess,
  onError,
  profileId,
  membershipType
}: PaymentWithCouponProps) {
  const [clientSecret, setClientSecret] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const { clientSecret: secret } = await createPaymentSession({
        membershipType,
        profileId
      });
      setClientSecret(secret);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment');
      onError(error instanceof Error ? error : new Error('Failed to initialize payment'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializePayment();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {clientSecret ? (
        <StripeProvider clientSecret={clientSecret}>
          <CheckoutForm
            onSuccess={onSuccess}
            onError={onError}
            profileId={profileId}
            membershipType={membershipType}
          />
        </StripeProvider>
      ) : null}
    </div>
  );
}
