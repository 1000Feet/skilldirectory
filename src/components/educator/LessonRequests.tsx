
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface LessonRequest {
  id: string;
  student_id: string;
  proposed_date: string;
  status: string;
  message: string | null;
  student: Student;
}

export function LessonRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LessonRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_requests')
          .select(`
            id,
            student_id,
            proposed_date,
            status,
            message,
            student:profiles!lesson_requests_student_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('educator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching lesson requests:', error);
        toast.error('Failed to load lesson requests');
      }
    };

    fetchRequests();
  }, [user]);

  const handleReply = (requestId: string) => {
    // This will be implemented later when we add the reply functionality
    toast.info('Reply functionality coming soon!');
  };

  // Show loading state only when we don't have user data yet
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lesson Requests</CardTitle>
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
        <CardTitle>Lesson Requests</CardTitle>
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
                    {request.student.first_name} {request.student.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {request.student.email}
                  </p>
                  <p className="text-sm">
                    Proposed: {format(new Date(request.proposed_date), 'PPp')}
                  </p>
                  {request.message && (
                    <p className="text-sm mt-2">{request.message}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleReply(request.id)}
                  className="ml-4"
                  size="sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
