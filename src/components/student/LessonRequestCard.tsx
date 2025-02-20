
import { format } from 'date-fns';
import { LessonRequest } from './types/lesson-request';

interface LessonRequestCardProps {
  request: LessonRequest;
}

export function LessonRequestCard({ request }: LessonRequestCardProps) {
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
    </div>
  );
}
