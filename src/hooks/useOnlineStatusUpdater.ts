import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type EducatorProfileUpdate = Database['public']['Tables']['educator_profiles']['Update'];

export const useOnlineStatusUpdater = (userId: string | undefined, isEducator: boolean) => {
  const updateLastActive = useCallback(async () => {
    if (!userId || !isEducator) return;

    try {
      const updateData: EducatorProfileUpdate = {
        last_active: new Date().toISOString()
      };

      await supabase
        .from('educator_profiles')
        .update(updateData)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last_active:', error);
    }
  }, [userId, isEducator]);

  useEffect(() => {
    if (!userId || !isEducator) return;

    // Update last_active on mount
    updateLastActive();

    // Set up interval to update last_active periodically
    const interval = setInterval(updateLastActive, 60000); // Update every minute

    // Update last_active on window focus
    const handleFocus = () => {
      updateLastActive();
    };
    window.addEventListener('focus', handleFocus);

    // Update last_active on user activity
    let activityTimeout: ReturnType<typeof setTimeout>;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateLastActive, 1000); // Debounce activity updates
    };
    
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('click', handleActivity);

    return () => {
      clearInterval(interval);
      clearTimeout(activityTimeout);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [userId, isEducator, updateLastActive]);
};
