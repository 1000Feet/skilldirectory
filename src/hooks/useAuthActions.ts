
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '@/lib/auth-types';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const signUp = async (email: string, password: string, userType: UserType) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });

      if (error) throw error;
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      console.log('Successfully signed out from Supabase');
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  return { signIn, signUp, signOut };
};
