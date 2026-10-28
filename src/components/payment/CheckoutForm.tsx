import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { FormEvent, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MembershipType } from '@/lib/auth-types';
import { updateMembership } from '@/api/update-membership';
import { CouponInput } from './CouponInput';
import { createPaymentIntent } from '@/api/create-payment-intent';
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
      // Create a new payment intent with the coupon if one is applied
      const paymentIntentResponse = await createPaymentIntent({
        membershipType,
        educatorId: profileId,
        couponCode: appliedCoupon || undefined
      });

      if (!paymentIntentResponse) {
        throw new Error('Failed to create payment intent');
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message);
        onError(new Error(submitError.message || 'Error submitting payment form'));
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentIntentResponse.clientSecret,
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
    if (discount.type === 'percentage') {
      const newPrice = originalPrice * (1 - discount.value / 100);
      setDiscountedPrice(parseFloat(newPrice.toFixed(2)));
    } else {
      const newPrice = Math.max(0, originalPrice - discount.value);
      setDiscountedPrice(parseFloat(newPrice.toFixed(2)));
    }
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(null);
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
          `Pay ${discountedPrice !== null ? `$${discountedPrice.toFixed(2)}` : `$${originalPrice.toFixed(2)}`}`
        )}
      </Button>
    </form>
  );
}
