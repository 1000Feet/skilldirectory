
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserType } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useProfileManagement } from '@/hooks/useProfileManagement';

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
  const { signIn: authSignIn, signUp, signOut: authSignOut } = useAuthActions();
  const { fetchProfile } = useProfileManagement();

  const handleSession = async (session: any) => {
    if (session) {
      const userType = session.user.user_metadata.user_type as UserType;
      const baseUser = {
        id: session.user.id,
        email: session.user.email!,
        user_metadata: {
          user_type: userType,
        },
      };
      setUser(baseUser);
      
      const profile = await fetchProfile(session.user.id, userType);
      if (profile) {
        setUser(prev => prev ? { ...prev, profile } : null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { session } = await authSignIn(email, password);
    await handleSession(session);
  };

  const signOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      await handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
