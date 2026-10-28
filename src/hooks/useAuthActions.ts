import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { callEdge } from '@/integrations/supabase/edge';
import { UserType, MembershipType } from '@/lib/auth-types';
import { toast } from 'sonner';
import { createPaymentIntent } from '@/services/payment';
import { useProfileManagement } from './useProfileManagement';

export const useAuthActions = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const profileManagement = useProfileManagement();

  const signUp = async (email: string, password: string, userType: UserType, membershipType?: MembershipType) => {
    try {
      console.log('Starting signup process:', { email, userType, membershipType });
      
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Step 1: Create auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            membership_type: userType === 'educator' ? membershipType : undefined
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        throw authError;
      }
      if (!authData.user) {
        toast.error('Failed to create account');
        throw new Error('Signup failed - no user data returned');
      }
      console.log('Auth user created:', authData.user.id);

      // Step 2: If user is an educator, create their profile and membership
      if (userType === 'educator' && membershipType) {
        try {
          // First check if profile already exists
          let profile = await profileManagement.fetchProfile(authData.user.id, 'educator');
          
          // If profile doesn't exist, create it
          if (!profile) {
            console.log('Creating educator profile...');
            profile = await profileManagement.createProfile(authData.user.id, 'educator', {
              email,
              name: email.split('@')[0],
              user_type: 'educator'
            });
            
            if (!profile) {
              throw new Error('Failed to create educator profile');
            }
          }
          
          console.log('Educator profile ready:', profile.id);

          // Step 3: Create the membership on the server (basic = active, paid = inactive
          // until the payment is confirmed by Stripe)
          console.log('Creating membership...', { educatorId: profile.id, type: membershipType });
          await callEdge('payments', 'init-membership', { educatorId: profile.id, membershipType });

          console.log('Membership created or verified successfully');
          
          // Step 4: Create payment intent for Stripe if not a free tier
          try {
            // If it's the basic (free) tier, we don't need a payment intent
            if (membershipType === 'basic') {
              console.log('Basic (free) tier selected - skipping payment intent creation');
              
              // Basic membership was already created as active by init-membership

              // Return without client secret for basic tier
              return { profileId: profile.id, skipPayment: true };
            }
            
            // For paid tiers, create a payment intent
            const secret = await createPaymentIntent(membershipType, profile.id);
            if (!secret) {
              console.log('No payment intent created - treating as free membership');
              
              // Free plan (e.g. 100% coupon): activated on the server
              return { profileId: profile.id, skipPayment: true };
            }
            
            setClientSecret(secret);
            return { clientSecret: secret, profileId: profile.id };
          } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
          }
        } catch (error) {
          console.error('Error in educator signup flow:', error);
          throw error;
        }
      }

      // Step 5: Automatically sign in the user if not an educator
      if (userType !== 'educator') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          toast.error('Failed to sign in automatically');
          return;
        }

        toast.success('Your account has been created successfully!');
        window.location.href = '/';
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if the account is deactivated (for both students and educators)
      if (data.user?.user_metadata?.user_type === 'student') {
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('is_active')
          .eq('user_id', data.user.id)
          .single();

        if (profileData && profileData.is_active === false) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          throw new Error('Your account has been deactivated. Please contact support for reactivation.');
        }
      } else if (data.user?.user_metadata?.user_type === 'educator') {
        const { data: profileData } = await supabase
          .from('educator_profiles')
          .select('is_active')
          .eq('user_id', data.user.id)
          .single();

        if (profileData && profileData.is_active === false) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          throw new Error('Your account has been deactivated. Please contact support for reactivation.');
        }
      }
      
      window.location.href = '/';
      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      window.location.href = '/auth';
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  return { signIn, signUp, signOut, clientSecret };
};
