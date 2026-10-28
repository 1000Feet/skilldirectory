import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import React from 'react';
import { env } from '@/config/env';

// Initialize Stripe
const stripePromise = loadStripe(env.stripePublishableKey);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
  options?: StripeElementsOptions;
}

export function StripeProvider({ children, clientSecret, options }: StripeProviderProps) {
  const elementsOptions = options ?? (clientSecret ? { clientSecret } : undefined);

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}
