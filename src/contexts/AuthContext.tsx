import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserType } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useProfileManagement } from '@/hooks/useProfileManagement';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userType: UserType) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { signIn, signUp, signOut } = useAuthActions();
  const { fetchProfile, updateProfile: updateUserProfile, createProfile } = useProfileManagement();

  useEffect(() => {
    // Initialize auth state from localStorage if available
    const savedSession = localStorage.getItem('supabase.auth.token');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session?.currentSession?.user) {
          handleUserChange(session.currentSession.user);
        }
      } catch (error) {
        console.error('Error parsing saved session:', error);
      }
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserChange(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      if (session?.user) {
        await handleUserChange(session.user, event);
      } else if (event === 'SIGNED_OUT') {
        // Only clear user if explicitly signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserChange = async (authUser: any, event?: string) => {
    try {
      const userType = authUser.user_metadata?.user_type as UserType;
      console.log('Handling user change:', authUser.id, userType);

      let profile = await fetchProfile(authUser.id, userType);
      
      if (!profile && event === 'SIGNED_UP') {
        console.log('Creating new profile for user:', authUser.id);
        const newProfileData = {
          email: authUser.email,
          user_type: userType,
          ...(userType === 'student' 
            ? { first_name: null, last_name: null, avatar_url: null }
            : { name: '', description: null, image: null }
          )
        };
        
        profile = await createProfile(authUser.id, userType, newProfileData);
      }

      const userData = {
        id: authUser.id,
        email: authUser.email,
        user_metadata: {
          user_type: userType
        },
        profile: profile || undefined
      };

      setUser(userData);
      
      // Save user data to localStorage for persistence
      localStorage.setItem('auth.user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error handling user change:', error);
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

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
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
