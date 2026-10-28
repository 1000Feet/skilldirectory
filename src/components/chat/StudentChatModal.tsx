import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

interface StudentChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  educatorId: string;  // This should be the educator's profile ID
  educatorName: string;
}

export function StudentChatModal({ isOpen, onOpenChange, educatorId, educatorName }: StudentChatModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [educatorUserId, setEducatorUserId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEducatorUserId = async () => {
      if (!educatorId) return;

      const { data, error } = await supabase
        .from('educator_profiles')
        .select('user_id')
        .eq('id', educatorId)
        .single();

      if (error) {
        console.error('Error fetching educator user ID:', error);
        return;
      }

      if (data) {
        setEducatorUserId(data.user_id);
      }
    };

    fetchEducatorUserId();
  }, [educatorId]);

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!educatorUserId) {
      toast.error('Unable to send message at this time');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: educatorUserId,  // Using the educator's user_id instead of profile id
          content: message.trim()
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message {educatorName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim() || !educatorUserId}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 