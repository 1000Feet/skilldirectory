
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: UserType) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      const table = userType === 'educator' ? 'educator_profiles' : 'student_profiles';
      console.log(`Fetching ${userType} profile from ${table}`);
      
      const { data: profile, error } = await supabase
        .from(table)
        .select('*')
        .eq(userType === 'educator' ? 'user_id' : 'id', userId)
        .single();

      if (error) {
        console.error(`Error fetching ${userType} profile:`, error);
        return;
      }

      if (profile) {
        console.log(`${userType} profile found:`, profile);
        setUser(prev => {
          if (!prev) return null;
          
          if (userType === 'student') {
            const studentProfile: StudentProfile = {
              id: profile.id,
              email: profile.email,
              user_type: userType,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url
            };
            return { ...prev, profile: studentProfile };
          } else {
            const educatorProfile: EducatorProfile = {
              id: profile.id,
              email: profile.email,
              user_type: userType,
              name: profile.name,
              description: profile.description,
              image: profile.image
            };
            return { ...prev, profile: educatorProfile };
          }
        });
      } else {
        console.log(`No ${userType} profile found`);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Initial session check - found session:', session);
        const userType = session.user.user_metadata.user_type as UserType;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: {
            user_type: userType,
          },
        });
        
        // Fetch profile data with correct user type
        fetchProfile(session.user.id, userType);
      } else {
        console.log('Initial session check - no session found');
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        const userType = session.user.user_metadata.user_type as UserType;
        console.log('Setting user from auth state change:', session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: {
            user_type: userType,
          },
        });
        
        // Fetch profile data with correct user type
        await fetchProfile(session.user.id, userType);
      } else {
        console.log('Auth state change - clearing user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

      // Success message with email verification info
      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Always stay on auth page after registration so user can verify email or sign in
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

      // Set user with metadata immediately after successful sign in
      if (data.user) {
        const userType = data.user.user_metadata.user_type as UserType;
        console.log('Sign in successful, setting user:', data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          user_metadata: {
            user_type: userType,
          },
        });
        
        // Fetch profile with correct user type
        await fetchProfile(data.user.id, userType);
      }

      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      // First clear the user state
      setUser(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      console.log('Successfully signed out from Supabase');
      toast.success('Signed out successfully');
      
      // Finally navigate to auth page
      console.log('Navigating to auth page...');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
