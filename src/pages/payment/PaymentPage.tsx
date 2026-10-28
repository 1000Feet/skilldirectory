import { useNavigate } from 'react-router-dom';
import { PaymentWithCoupon } from '@/components/payment/PaymentWithCoupon';
import { MembershipType } from '@/lib/auth-types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MEMBERSHIP_PRICES } from '@/services/payment-config';

export function PaymentPage() {
  const navigate = useNavigate();
  const [membershipType, setMembershipType] = useState<MembershipType>('standard');
  const [profileId, setProfileId] = useState<string>();

  // Get membership type and profile ID from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') as MembershipType;
    const id = params.get('profileId');

    if (type && ['standard', 'premium'].includes(type)) {
      setMembershipType(type);
    }
    if (id) {
      setProfileId(id);
    }
  }, []);

  const handleSuccess = () => {
    toast.success('Payment successful!');
    navigate('/dashboard');
  };

  const handleError = (error: Error) => {
    toast.error(error.message);
  };

  const getPriceDisplay = () => {
    return MEMBERSHIP_PRICES[membershipType];
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">
          Change to {membershipType === 'premium' ? 'Premium' : 'Standard'} Plan
        </h1>
        <p className="text-xl mt-2">
          {getPriceDisplay()}/month - Please provide your payment details
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Enter a promo code during checkout to get a discount
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <PaymentWithCoupon
          onSuccess={handleSuccess}
          onError={handleError}
          profileId={profileId}
          membershipType={membershipType}
        />
      </div>
    </div>
  );
}
