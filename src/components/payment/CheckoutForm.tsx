import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { FormEvent, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MembershipType } from '@/lib/auth-types';
import { updateMembership } from '@/api/update-membership';
import { CouponInput } from './CouponInput';
import { createSubscription } from '@/api/create-payment-intent';
import { MEMBERSHIP_PRODUCTS } from '@/services/payment-config';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  profileId?: string;
  membershipType?: MembershipType;
}

export function CheckoutForm({ 
  onSuccess, 
  onError,
  profileId,
  membershipType = 'standard'
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number>(
    MEMBERSHIP_PRODUCTS[membershipType].amount / 100
  );
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  useEffect(() => {
    // Update original price when membership type changes
    setOriginalPrice(MEMBERSHIP_PRODUCTS[membershipType].amount / 100);
  }, [membershipType]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !profileId) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Validate the card form (required before creating the subscription)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message);
        return;
      }

      // 2. Create the monthly subscription on the server (with the coupon, if any)
      const subscription = await createSubscription({
        membershipType,
        educatorId: profileId,
        couponCode: appliedCoupon || undefined
      });

      if (subscription.free) {
        // Nothing to pay now (e.g. 100% coupon): the plan is already active
        toast.success('Membership updated successfully!');
        onSuccess();
        return;
      }

      // 3. Confirm the first payment; the card is saved for the automatic monthly renewals
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: 'clientSecret' in subscription ? subscription.clientSecret : undefined,
        confirmParams: { return_url: `${window.location.origin}/payment-complete` },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
        onError(new Error(error.message || 'Payment confirmation failed'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, now update the membership in the database
        if (profileId && membershipType) {
          try {
            await updateMembership(profileId, membershipType, paymentIntent.id);
            toast.success('Membership updated successfully!');
          } catch (err) {
            console.error('Error updating membership:', err);
            toast.error('Payment successful, but failed to update membership. Please contact support.');
          }
        }
        
        onSuccess();
      } else {
        // This shouldn't happen, but handle it just in case
        toast.error('Payment status unknown. Please refresh and try again.');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      onError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCouponApplied = async (discount: { type: 'percentage' | 'fixed'; value: number }, code: string) => {
    setAppliedCoupon(code);
    
    // Calculate discounted price
    const newPrice = discount.type === 'percentage'
      ? originalPrice * (1 - discount.value / 100)
      : Math.max(0, originalPrice - discount.value);
    const rounded = parseFloat(newPrice.toFixed(2));
    setDiscountedPrice(rounded);
    // Keep the payment form in sync with the amount of the first invoice
    if (rounded > 0) elements?.update({ amount: Math.round(rounded * 100) });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(null);
    elements?.update({ amount: Math.round(originalPrice * 100) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Membership Price</h3>
            <div className="text-right">
              {discountedPrice !== null ? (
                <>
                  <span className="text-gray-500 line-through mr-2">${originalPrice.toFixed(2)}</span>
                  <span className="font-semibold text-green-600">${discountedPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="font-semibold">${originalPrice.toFixed(2)}</span>
              )}
              <span className="text-gray-500 text-sm">/month</span>
            </div>
          </div>
          
          <h3 className="text-sm font-medium mb-2">Have a promo code?</h3>
          <CouponInput
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            disabled={isProcessing}
          />
          
          {appliedCoupon && (
            <div className="mt-2 text-sm text-green-600 font-semibold">
              Coupon code {appliedCoupon} applied
            </div>
          )}
        </div>
        
        <PaymentElement />
        <p className="text-xs text-gray-500">
          Your membership renews automatically every month. You can cancel anytime by switching to the Basic plan.
        </p>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe for ${discountedPrice !== null ? `$${discountedPrice.toFixed(2)}` : `$${originalPrice.toFixed(2)}`}/month`
        )}
      </Button>
    </form>
  );
}
