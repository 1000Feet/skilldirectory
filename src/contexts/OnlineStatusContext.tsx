import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineStatus {
  isOnline: boolean;
  lastActive: string | null;
}

interface OnlineStatusContextValue {
  isUserOnline: (userId: string) => boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextValue>({
  isUserOnline: () => false,
});

const isRecentlyActive = (lastActive: string): boolean => {
  const thirtyMinutesAgo = new Date();
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
  return new Date(lastActive) > thirtyMinutesAgo;
};

export const OnlineStatusProvider = ({ children }: { children: ReactNode }) => {
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
          educators.forEach(educator => {
            if (educator.last_active) {
              updatedStatus[educator.id] = {
                isOnline: isRecentlyActive(educator.last_active),
                lastActive: educator.last_active,
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

    // Single shared real-time subscription for online status changes
    const channel = supabase
      .channel('online-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'educator_profiles',
          filter: 'last_active=is.not.null',
        },
        (payload) => {
          if (payload.new.last_active) {
            setOnlineUsers(current => ({
              ...current,
              [payload.new.id]: {
                isOnline: isRecentlyActive(payload.new.last_active),
                lastActive: payload.new.last_active,
              },
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
    return isRecentlyActive(status.lastActive);
  };

  return (
    <OnlineStatusContext.Provider value={{ isUserOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => useContext(OnlineStatusContext);
