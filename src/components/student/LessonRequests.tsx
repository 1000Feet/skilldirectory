
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonRequests } from './hooks/useLessonRequests';
import { LessonRequestCard } from './LessonRequestCard';

export function LessonRequests() {
  const { user } = useAuth();
  const { requests, loading } = useLessonRequests(user?.id);

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons Requested</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No lesson requests yet
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <LessonRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
