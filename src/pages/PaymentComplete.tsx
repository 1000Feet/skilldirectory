import { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { updateMembershipStatus } from '@/services/payment';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentComplete() {
  const stripe = useStripe();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'succeeded' | 'failed'>('processing');

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter from the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      navigate('/');
      return;
    }

    stripe
      .retrievePaymentIntent(clientSecret)
      .then(async ({ paymentIntent }) => {
        if (!paymentIntent) return;

        console.log('Payment intent received:', paymentIntent);

        switch (paymentIntent.status) {
          case 'succeeded':
            setStatus('succeeded');
            try {
              // Activate the membership: the server verifies the payment with Stripe
              const updateResult = await updateMembershipStatus(paymentIntent.id);
              if (!updateResult) {
                throw new Error('Membership activation failed');
              }
              console.log('Membership status updated:', updateResult);
              
              toast.success('Payment successful! Your membership is now active.');
              
              // Redirect to dashboard
              setTimeout(() => {
                navigate('/dashboard');
              }, 1500); // Short delay to show success message
            } catch (error) {
              console.error('Error finalizing membership:', error);
              // Even if there's an error, redirect to dashboard after a longer delay
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
              toast.error('Payment successful, but there was an issue activating your membership. Please contact support.');
            }
            break;
          case 'processing':
            setStatus('processing');
            toast.info('Your payment is processing.');
            break;
          default:
            setStatus('failed');
            toast.error('Payment failed. Please try again.');
            setTimeout(() => {
              navigate('/auth');
            }, 2000);
            break;
        }
      });
  }, [stripe, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 space-y-4 text-center">
        {status === 'processing' && (
          <h1 className="text-2xl font-bold">Processing your payment...</h1>
        )}
        {status === 'succeeded' && (
          <>
            <h1 className="text-2xl font-bold">Payment successful!</h1>
            <p className="text-gray-600">Your membership is now active. Redirecting to your dashboard...</p>
          </>
        )}
        {status === 'failed' && (
          <h1 className="text-2xl font-bold">Payment failed</h1>
        )}
      </div>
    </div>
  );
}
