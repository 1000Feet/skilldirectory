import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '@/lib/auth-types';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const clearAuthCache = async () => {
    try {
      // Clear any cached auth data
      localStorage.removeItem('supabase.auth.token');
      // Clear any other auth-related items
      const authKeys = Object.keys(localStorage).filter(key => key.startsWith('supabase.auth.'));
      authKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  };

  const signUp = async (email: string, password: string, userType: UserType) => {
    try {
      await clearAuthCache();
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
      await clearAuthCache();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Force a session refresh
      await supabase.auth.getSession();
      
      navigate('/', { replace: true });
      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await clearAuthCache();
      
      console.log('Successfully signed out');
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  return { signIn, signUp, signOut };
};
