import { useEffect, useState } from 'react';
import { callEdge } from '@/integrations/supabase/edge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SupportSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  issue_type: 'general' | 'bug' | 'feature' | 'account' | 'other';
  message: string;
  created_at: string;
  resolved: boolean;
}

export function SupportSubmissionsManager() {
  const [submissions, setSubmissions] = useState<SupportSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<SupportSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await callEdge<{ data: SupportSubmission[] }>('admin-api', 'list-support');

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching support submissions:', error);
      toast.error('Failed to fetch support submissions');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    setIsDeleting(true);
    try {
      await callEdge('admin-api', 'delete-support', { id: submissionId });

      setSubmissions(submissions.filter(sub => sub.id !== submissionId));
      toast.success('Support submission deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting support submission:', error);
      toast.error('Failed to delete support submission');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (submission: SupportSubmission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Support Submissions</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {submission.first_name} {submission.last_name}
                  </TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell className="capitalize">{submission.issue_type}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {submission.message}
                  </TableCell>
                  <TableCell>
                    <AlertDialog open={deleteDialogOpen && submissionToDelete?.id === submission.id}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(submission)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Support Submission</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this support submission? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSubmission(submission.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
