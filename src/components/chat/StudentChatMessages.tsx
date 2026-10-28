import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface StudentChatMessagesProps {
  educatorId: string;
  educatorName: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read_at: string | null;
}

export function StudentChatMessages({ educatorId, educatorName }: StudentChatMessagesProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchMessages = async () => {
    if (!user || !educatorId) return;

    try {
      // Get messages between the student and educator
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${educatorId}),and(sender_id.eq.${educatorId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(data);
        scrollToBottom();

        // Mark received messages as read
        const unreadMessageIds = data
          .filter(
            (msg) => msg.sender_id === educatorId && msg.receiver_id === user.id && !msg.read_at
          )
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
          const { error: updateError } = await supabase
            .from('chat_messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessageIds);

          if (updateError) {
            console.error('Error marking messages as read:', updateError);
          } else {
            // Broadcast message read update
            await supabase.channel('broadcast').send({
              type: 'broadcast',
              event: 'message_read',
              payload: { user_id: user.id, educator_id: educatorId },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  useEffect(() => {
    if (user && educatorId) {
      fetchMessages();

      // Subscribe to message updates
      const channel = supabase
        .channel(`chat_${user.id}_${educatorId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${educatorId}),and(sender_id.eq.${educatorId},receiver_id.eq.${user.id}))`,
          },
          (payload) => {
            // Add new message to state
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();

            // Mark message as read if it's from the educator
            if (newMsg.sender_id === educatorId && newMsg.receiver_id === user.id) {
              supabase
                .from('chat_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMsg.id)
                .then(({ error }) => {
                  if (error) {
                    console.error('Error marking message as read:', error);
                  } else {
                    // Broadcast message read update
                    supabase.channel('broadcast').send({
                      type: 'broadcast',
                      event: 'message_read',
                      payload: { user_id: user.id, educator_id: educatorId },
                    });
                  }
                });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${educatorId}),and(sender_id.eq.${educatorId},receiver_id.eq.${user.id}))`,
          },
          (payload) => {
            // Update message in state
            const updatedMsg = payload.new as Message;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
            );
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, educatorId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !educatorId) return;

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      setNewMessage('');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: educatorId,
          content: messageContent,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
        return;
      }

      // No need to add the message to state as it will come through the subscription
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold">{educatorName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOutgoing = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg ${
                      isOutgoing
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="break-words">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      {isOutgoing && message.read_at && (
                        <span className="ml-2">• Read</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
} 