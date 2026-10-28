import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEngagementRate } from '@/hooks/useEngagementRate';
import { useProfileViews } from '@/hooks/useProfileViews';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Calendar, Eye, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface StudentEngagementDetailsProps {
  educatorId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface EngagementStats {
  lessonRequests: number;
  recentVisits: {
    date: string;
    count: number;
  }[];
  peakHours: {
    hour: number;
    count: number;
  }[];
}

type EngagementMetrics = {
  engagement_rate: number;
  total_interactions: number;
  lesson_requests: number;
};

export function StudentEngagementDetails({ educatorId, isOpen, onClose }: StudentEngagementDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EngagementStats>({
    lessonRequests: 0,
    recentVisits: [],
    peakHours: []
  });

  // Get the same stats that the dashboard uses
  const { viewStats, loading: viewStatsLoading } = useProfileViews(educatorId);
  const { metrics: engagementMetrics, loading: engagementLoading } = useEngagementRate(educatorId);

  useEffect(() => {
    if (isOpen) {
      fetchEngagementStats();
    }
  }, [isOpen, educatorId]);

  const fetchEngagementStats = async () => {
    try {
      setLoading(true);
      
      // Fetch profile views for processing charts/trends
      const { data: viewsData, error: viewsError } = await supabase
        .from('profile_views')
        .select('*')
        .eq('educator_profile_id', educatorId);

      if (viewsError) throw viewsError;

      // Fetch all lesson requests without time filtering
      const { data: requestsData, error: requestsError } = await supabase
        .from('lesson_requests')
        .select('*')
        .eq('educator_profile_id', educatorId);

      if (requestsError) throw requestsError;
      
      // Get most recent 30 days of data for views
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Filter views for recent data
      const recentViews = viewsData?.filter(view => {
        const viewDate = new Date(view.created_at);
        return !isNaN(viewDate.getTime()) && viewDate >= thirtyDaysAgo;
      }) || [];
      
      // Process recent visits (last 30 days by day)
      const recentVisits = recentViews.reduce((acc: any[], view) => {
        const viewDate = new Date(view.created_at);
        if (isNaN(viewDate.getTime())) return acc; // Skip invalid dates
        
        const date = format(viewDate, 'yyyy-MM-dd');
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
          existingDate.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7) || [];

      // Process peak hours
      const peakHours = viewsData?.reduce((acc: any[], view) => {
        const viewDate = new Date(view.created_at);
        if (isNaN(viewDate.getTime())) return acc; // Skip invalid dates
        
        const hour = viewDate.getHours();
        const existingHour = acc.find(item => item.hour === hour);
        if (existingHour) {
          existingHour.count++;
        } else {
          acc.push({ hour, count: 1 });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5) || [];

      // Set the total number of lesson requests
      const totalLessonRequests = requestsData?.length || 0;
      console.log('Total lesson requests:', totalLessonRequests);

      setStats({
        lessonRequests: totalLessonRequests,
        recentVisits,
        peakHours
      });
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'ha');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM d, yyyy');
  };

  const isLoading = loading || engagementLoading || viewStatsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Student Engagement Details</DialogTitle>
          <DialogDescription>
            Detailed analytics about student interactions with your profile
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{engagementMetrics.engagement_rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on interactions in the last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{viewStats.totalViews}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{engagementMetrics.total_interactions}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lesson Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.lessonRequests}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {stats.recentVisits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Profile Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.recentVisits.map((visit) => (
                      <div key={visit.date} className="flex justify-between items-center">
                        <span>{formatDate(visit.date)}</span>
                        <span className="font-semibold">{visit.count} views</span>
                      </div>
                    ))}
                    {stats.recentVisits.length === 0 && (
                      <div className="text-center text-muted-foreground py-2">
                        No recent profile visits
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.peakHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Peak Activity Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.peakHours.map((peak) => (
                      <div key={peak.hour} className="flex justify-between items-center">
                        <span>{formatHour(peak.hour)}</span>
                        <span className="font-semibold">{peak.count} views</span>
                      </div>
                    ))}
                    {stats.peakHours.length === 0 && (
                      <div className="text-center text-muted-foreground py-2">
                        No peak hours data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 