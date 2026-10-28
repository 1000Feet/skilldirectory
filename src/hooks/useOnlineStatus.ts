import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineStatus {
  isOnline: boolean;
  lastActive: string | null;
}

export const useOnlineStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineStatus>>({});
  
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const { data: educators, error } = await supabase
          .from('educator_profiles')
          .select('id, last_active')
          .not('last_active', 'is', null);
        
        if (error) {
          console.error('Error fetching online status:', error);
          return;
        }
        
        if (educators) {
          const updatedStatus: Record<string, OnlineStatus> = {};
          const thirtyMinutesAgo = new Date();
          thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
          
          educators.forEach(educator => {
            if (educator.last_active) {
              const isRecentlyActive = new Date(educator.last_active) > thirtyMinutesAgo;
              updatedStatus[educator.id] = {
                isOnline: isRecentlyActive,
                lastActive: educator.last_active
              };
            }
          });
          
          setOnlineUsers(updatedStatus);
        }
      } catch (error) {
        console.error('Error fetching online status:', error);
      }
    };

    // Initial fetch
    fetchOnlineStatus();

    // Set up real-time subscription for online status changes
    const channel = supabase
      .channel('online-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'educator_profiles',
          filter: 'last_active=is.not.null'
        },
        (payload) => {
          if (payload.new.last_active) {
            const thirtyMinutesAgo = new Date();
            thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
            const isRecentlyActive = new Date(payload.new.last_active) > thirtyMinutesAgo;
            
            setOnlineUsers(current => ({
              ...current,
              [payload.new.id]: {
                isOnline: isRecentlyActive,
                lastActive: payload.new.last_active
              }
            }));
          }
        }
      )
      .subscribe();

    // Refresh status every minute
    const interval = setInterval(fetchOnlineStatus, 60000);

    // Cleanup subscription and interval
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const isUserOnline = (userId: string): boolean => {
    const status = onlineUsers[userId];
    if (!status || !status.lastActive) return false;

    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    return new Date(status.lastActive) > thirtyMinutesAgo;
  };

  return { isUserOnline };
};
