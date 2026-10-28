import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileViewTrackerProps {
  educatorProfileId: string;
}

export const ProfileViewTracker = ({ educatorProfileId }: ProfileViewTrackerProps) => {
  const { user } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      // Don't track if the viewer is the profile owner
      if (user?.id === educatorProfileId) {
        return;
      }

      // Check if view was already tracked in this session
      const sessionKey = `profile_view_${educatorProfileId}`;
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      try {
        // Get IP address for tracking unique views with fallback
        let ip = null;
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          if (!response.ok) {
            throw new Error('Failed to fetch IP');
          }
          const data = await response.json();
          ip = data.ip;
        } catch (ipError) {
          console.warn('Failed to get IP address:', ipError);
          // Continue without IP, will fall back to user ID for uniqueness
        }

        const { error } = await supabase
          .from('profile_views')
          .insert({
            educator_profile_id: educatorProfileId,
            viewer_id: user?.id || null,
            ip_address: ip
          });

        if (error) {
          console.error('Error tracking profile view:', error);
          return;
        }

        // Mark view as tracked in session storage
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };

    trackView();
  }, [educatorProfileId, user?.id]);

  return null;
};
