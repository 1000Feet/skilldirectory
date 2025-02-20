
import { format } from 'date-fns';
import { LessonRequest } from './types/lesson-request';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonRequestCardProps {
  request: LessonRequest;
}

export function LessonRequestCard({ request }: LessonRequestCardProps) {
  const handleCancelRequest = async () => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({ status: 'cancelled' })
        .eq('id', request.id);

      if (error) throw error;
      toast.success('Lesson request cancelled successfully');
    } catch (error) {
      console.error('Error cancelling lesson request:', error);
      toast.error('Failed to cancel lesson request');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="space-y-1">
        <h4 className="font-medium">
          {request.educator?.name}
        </h4>
        <p className="text-sm text-muted-foreground">
          {request.educator?.email}
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
      {request.status === 'pending' && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleCancelRequest}
          className="flex-shrink-0"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Request
        </Button>
      )}
    </div>
  );
}
