import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessagesProps {
  studentId: string;
  studentName: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read_at: string | null;
}

export function ChatMessages({ studentId, studentName }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !studentId) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data);

      // Mark received messages as read
      const unreadMessages = data.filter(
        (msg) => msg.receiver_id === user.id && !msg.read_at
      );

      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() })
          .in(
            'id',
            unreadMessages.map((msg) => msg.id)
          );

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        } else {
          // Emit an UPDATE event for each message marked as read
          unreadMessages.forEach(msg => {
            supabase.channel('chat_updates')
              .send({
                type: 'broadcast',
                event: 'message_read',
                payload: { message_id: msg.id, user_id: user.id }
              });
          });
        }
      }
    };

    fetchMessages();

    // Create a channel for real-time updates
    const channel = supabase.channel('chat_messages');

    // Subscribe to database changes
    channel.on(
      'postgres_changes',
      {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'chat_messages',
        filter: `or(and(sender_id.eq.${user?.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${user?.id}))`
      },
      async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark message as read if we're the receiver
          if (newMessage.receiver_id === user?.id) {
            const { error: updateError } = await supabase
              .from('chat_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id);

            if (updateError) {
              console.error('Error marking message as read:', updateError);
            } else {
              // Emit a message_read event
              supabase.channel('chat_updates')
                .send({
                  type: 'broadcast',
                  event: 'message_read',
                  payload: { message_id: newMessage.id, user_id: user.id }
                });
            }
          }

          scrollToBottom();
        } else if (payload.eventType === 'UPDATE') {
          // Refresh messages when updates occur (e.g., read status changes)
          fetchMessages();
        }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, studentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !studentId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageContent = newMessage.trim();
      setNewMessage(''); // Clear input immediately for better UX

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: messageContent,
          sender_id: user.id,
          receiver_id: studentId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new message to the state immediately
      if (data) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{studentName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(message.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
} 