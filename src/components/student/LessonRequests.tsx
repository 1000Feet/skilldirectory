
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Educator {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface LessonRequest {
  id: string;
  educator_id: string;
  proposed_date: string;
  status: string;
  message: string | null;
  educator: Educator;
}

export function LessonRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_requests')
          .select(`
            *,
            educator:profiles!lesson_requests_educator_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching lesson requests:', error);
        toast.error('Failed to load lesson requests');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchRequests();

    // Set up real-time subscription
    const subscription = supabase
      .channel('student_lesson_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_requests',
          filter: `student_id=eq.${user.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lessons Requested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons Requested</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No lesson requests yet
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">
                    {request.educator.first_name} {request.educator.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {request.educator.email}
                  </p>
                  <p className="text-sm">
                    Proposed: {format(new Date(request.proposed_date), 'PPp')}
                  </p>
                  {request.message && (
                    <p className="text-sm mt-2">{request.message}</p>
                  )}
                  <p className="text-sm font-medium mt-2 capitalize">
                    Status: {request.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
