import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useMembershipStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) {
          navigate('/auth');
          return;
        }

        // First get the educator profile
        const { data: profileData, error: profileError } = await supabase
          .from('educator_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) {
          navigate('/');
          return;
        }

        // Then check membership status
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('status')
          .eq('educator_id', profileData.id)
          .single();

        if (membershipError) throw membershipError;
        
        const active = membershipData?.status === 'active';
        setIsActive(active);
        
        if (!active) {
          toast.error('Your membership status is inactive');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkMembershipStatus();
  }, [navigate]);

  return { isLoading, isActive };
};
