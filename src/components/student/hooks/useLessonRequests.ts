
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LessonRequest } from '../types/lesson-request';

export function useLessonRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        console.log('Fetching requests for student:', userId);
        const { data, error } = await supabase
          .from('lesson_requests')
          .select(`
            *,
            educator:educator_profiles!lesson_requests_educator_profile_id_fkey(
              id,
              email,
              name
            )
          `)
          .eq('student_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching lesson requests:', error);
          throw error;
        }

        console.log('Fetched lesson requests:', data);
        setRequests(data as LessonRequest[]);
      } catch (error: any) {
        console.error('Failed to load lesson requests:', error);
        toast.error('Failed to load lesson requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    const channel = supabase
      .channel('student_lesson_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_requests',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { requests, loading };
}
