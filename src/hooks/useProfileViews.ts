import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type ViewCountResult = {
  total_views: number;
  unique_views: number;
  last_24h_views: number;
};

interface ViewStats {
  totalViews: number;
  uniqueViews: number;
  last24hViews: number;
}

export const useProfileViews = (educatorProfileId: string | undefined) => {
  const [viewStats, setViewStats] = useState<ViewStats>({
    totalViews: 0,
    uniqueViews: 0,
    last24hViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchViewStats = async () => {
      if (!educatorProfileId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase.rpc<ViewCountResult, { educator_id: string }>(
          'get_profile_view_count',
          { educator_id: educatorProfileId }
        );

        if (error) {
          console.error('Error fetching profile views:', error);
          return;
        }

        if (data && data[0] && mounted) {
          setViewStats({
            totalViews: Number(data[0].total_views) || 0,
            uniqueViews: Number(data[0].unique_views) || 0,
            last24hViews: Number(data[0].last_24h_views) || 0
          });
        }
      } catch (error) {
        console.error('Error fetching profile views:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchViewStats();

    // Set up real-time subscription for view updates
    const channel = supabase
      .channel(`profile-views-${educatorProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_views',
          filter: `educator_profile_id=eq.${educatorProfileId}`
        },
        () => {
          fetchViewStats();
        }
      )
      .subscribe();

    // Refresh stats every minute to keep last 24h views accurate
    const interval = setInterval(fetchViewStats, 60000);

    return () => {
      mounted = false;
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [educatorProfileId]);

  return { viewStats, loading };
};
