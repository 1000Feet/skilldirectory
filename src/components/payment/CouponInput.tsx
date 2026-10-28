import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { validateCouponCode } from '@/api/validate-coupon-api';
import { toast } from 'sonner';

interface CouponInputProps {
  onCouponApplied: (discount: { type: 'percentage' | 'fixed'; value: number }, code: string) => void;
  onCouponRemoved: () => void;
  disabled?: boolean;
}

export function CouponInput({ onCouponApplied, onCouponRemoved, disabled }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleValidateCoupon = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCouponCode(code.trim());
      
      if (result.valid && result.discount) {
        setAppliedCode(code);
        // Use the couponId from the result if available, otherwise use the entered code
        // This ensures we use the actual Stripe coupon ID even when the user entered a coupon name
        onCouponApplied(result.discount, result.couponId || code.trim());
        toast.success('Coupon applied successfully!');
      } else {
        toast.error(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setCode('');
    onCouponRemoved();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled || !!appliedCode || isValidating}
          className="flex-1"
        />
        {appliedCode ? (
          <Button 
            onClick={handleRemoveCoupon}
            variant="outline"
            disabled={disabled || isValidating}
          >
            Remove
          </Button>
        ) : (
          <Button 
            onClick={handleValidateCoupon}
            disabled={disabled || !code.trim() || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        )}
      </div>
      {appliedCode && (
        <p className="text-sm text-green-600">
          Coupon code {appliedCode} applied
        </p>
      )}
    </div>
  );
}
