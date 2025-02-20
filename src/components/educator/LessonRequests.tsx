
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

  const handleReply = (requestId: string) => {
    toast.info('Reply functionality coming soon!');
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          No lesson requests yet
        </div>
      </CardContent>
    </Card>
  );
}
