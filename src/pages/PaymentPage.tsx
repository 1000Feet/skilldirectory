import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StripeProvider } from '@/providers/StripeProvider';
import { CheckoutForm } from '@/components/payment/CheckoutForm';
import { toast } from 'sonner';
import { MembershipType } from '@/lib/auth-types';
import { Loader2 } from 'lucide-react';
import { MEMBERSHIP_PRICES } from '@/services/payment-config';

// Membership plan details for display
const MEMBERSHIP_NAMES = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium"
};

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get data from location state
  const clientSecret = location.state?.clientSecret;
  const profileId = location.state?.profileId;
  const membershipType = location.state?.membershipType as MembershipType;
  const isUpgrade = location.state?.isUpgrade;

  const actionText = isUpgrade ? 'Upgrade to' : 'Change to';

  useEffect(() => {
    if (!clientSecret || !profileId || !membershipType) {
      toast.error('Invalid payment session');
      navigate('/dashboard');
      return;
    }
    
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [clientSecret, profileId, membershipType, navigate]);

  if (!clientSecret || !profileId || !membershipType) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">{actionText} {MEMBERSHIP_NAMES[membershipType]} Plan</h1>
        <p className="text-muted-foreground text-center">
          {MEMBERSHIP_PRICES[membershipType]}/month - Please provide your payment details
        </p>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparing payment form...</p>
          </div>
        ) : (
          <StripeProvider clientSecret={clientSecret}>
            <CheckoutForm
              profileId={profileId}
              membershipType={membershipType}
              onSuccess={() => {
                toast.success('Payment successful!');
                navigate('/dashboard');
              }}
              onError={(error) => {
                toast.error(error.message || 'Payment failed');
                navigate('/dashboard');
              }}
            />
          </StripeProvider>
        )}
      </div>
    </div>
  );
}
