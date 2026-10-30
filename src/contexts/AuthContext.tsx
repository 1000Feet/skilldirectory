import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useOnlineStatusUpdater } from '@/hooks/useOnlineStatusUpdater';
import { UserType } from '@/lib/auth-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userType: UserType,
    membershipType?: string
  ) => Promise<
    | { profileId: string; skipPayment: boolean }
    | { profileId: string; needsPayment: true }
  >;
  userType: UserType | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Mirrors `user` for use inside the auth-state listener closure
  const userRef = useRef<User | null>(null);
  const { signIn, signUp, signOut } = useAuthActions();
  const { fetchProfile, updateProfile: updateUserProfile, createProfile } = useProfileManagement();
  
  // Use the online status updater
  const isEducator = user?.user_metadata?.user_type === 'educator';
  useOnlineStatusUpdater(user?.id, isEducator);

  useEffect(() => {
    // Check active sessions and sets the user.
    // Await handleUserChange so `loading` stays true until the profile is
    // hydrated — otherwise ProtectedRoute briefly sees `user === null` and
    // redirects signed-in users away from their dashboard on refresh.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await handleUserChange(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // If no user is hydrated yet (e.g. right after sign-up/sign-in),
        // keep the app in loading state while the profile loads.
        if (!userRef.current) {
          setLoading(true);
        }
        await handleUserChange(session.user);
      } else {
        userRef.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserChange = async (authUser: User) => {
    try {
      const userType = authUser.user_metadata?.user_type as UserType;
      console.log('Handling user change:', authUser.id, userType);

      // Check for deactivated accounts
      if (userType === 'student') {
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('is_active')
          .eq('user_id', authUser.id)
          .single();

        if (profileData && profileData.is_active === false) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          // toast.error('Your account has been deactivated. Please contact support for reactivation.');
          setUser(null);
          return;
        }
      } else if (userType === 'educator') {
        const { data: profileData } = await supabase
          .from('educator_profiles')
          .select('is_active')
          .eq('user_id', authUser.id)
          .single();

        if (profileData && profileData.is_active === false) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          // toast.error('Your account has been deactivated. Please contact support for reactivation.');
          setUser(null);
          return;
        }
      }

      // Try to get profile from local storage first
      const storedUserData = localStorage.getItem('auth.user');
      let profile = storedUserData ? JSON.parse(storedUserData).profile : null;

      // If no profile in storage, fetch or create from DB
      if (!profile) {
        // First try to fetch existing profile
        profile = await fetchProfile(authUser.id, userType);
        
        // If no profile exists, create one
        if (!profile) {
          console.log('No profile found, creating new profile');
          await createProfile(authUser.id, userType, {
            email: authUser.email,
            user_type: userType
          });
          // Fetch the newly created profile
          profile = await fetchProfile(authUser.id, userType);
        }
      }

      const userData: User = {
        ...authUser,
        user_metadata: {
          ...authUser.user_metadata,
          profile
        }
      };

      setUser(userData);
      
      // Save user data to localStorage for persistence
      localStorage.setItem('auth.user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error handling user change:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('auth.user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedProfile = await updateUserProfile(
      user.id,
      user.user_metadata.user_type,
      data
    );

    const updatedUser = {
      ...user,
      profile: updatedProfile
    };

    setUser(updatedUser);
    localStorage.setItem('auth.user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    userType: user?.user_metadata?.user_type || null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
