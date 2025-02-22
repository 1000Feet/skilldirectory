import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserType, Profile } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useProfileManagement } from '@/hooks/useProfileManagement';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userType: UserType) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { signIn, signUp, signOut } = useAuthActions();
  const { updateProfile } = useProfileManagement();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata as { user_type: UserType }
        };

        setUser(authUser);
      }
      setLoading(false);
    }

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata as { user_type: UserType }
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
    })
  }, []);

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
