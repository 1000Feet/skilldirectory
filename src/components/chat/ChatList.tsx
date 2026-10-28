import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessages } from './ChatMessages';

interface ChatPreview {
  id: string;
  student_id: string;
  student_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read_at: string | null;
}

export function ChatList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;

      // Get all conversations (both sent and received messages)
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      // Process messages to get unique chats with latest message
      const chatMap = new Map<string, ChatPreview>();
      
      for (const message of messages) {
        // Determine if the other party is sender or receiver
        const isReceived = message.receiver_id === user.id;
        const otherPartyId = isReceived ? message.sender_id : message.receiver_id;
        
        if (!chatMap.has(otherPartyId)) {
          // Get the student's profile
          const { data: studentProfile } = await supabase
            .from('student_profiles')
            .select('name')
            .eq('user_id', otherPartyId)
            .single();

          // Count all unread messages for this chat
          const unreadCount = messages.filter(
            msg => msg.receiver_id === user.id && 
                  msg.sender_id === otherPartyId && 
                  !msg.read_at
          ).length;
          
          chatMap.set(otherPartyId, {
            id: message.id,
            student_id: otherPartyId,
            student_name: studentProfile?.name || otherPartyId,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: unreadCount
          });
        }
      }

      setChats(Array.from(chatMap.values()));
    };

    fetchChats();

    // Subscribe to new messages and read status updates
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(receiver_id.eq.${user?.id},sender_id.eq.${user?.id})`
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'broadcast',
        { event: 'message_read' },
        () => {
          fetchChats(); // Refresh chat list when messages are marked as read
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleChatSelect = async (studentId: string, studentName: string) => {
    setSelectedChat(studentId);
    setSelectedStudentName(studentName);

    if (!user) return;

    // Mark messages as read in the database
    const { data: unreadMessages } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('sender_id', studentId)
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (unreadMessages && unreadMessages.length > 0) {
      // Update read_at for all unread messages from this student
      const { error } = await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(msg => msg.id));

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        // Emit broadcast events for each message marked as read
        unreadMessages.forEach(msg => {
          supabase.channel('chat_updates').send({
            type: 'broadcast',
            event: 'message_read',
            payload: { message_id: msg.id, user_id: user.id }
          });
        });
      }
    }

    // Update chat preview to reflect read status immediately
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.student_id === studentId 
          ? { ...chat, unread_count: 0 }
          : chat
      )
    );
  };

  return (
    <div className="flex h-[600px] border rounded-lg">
      <div className="w-1/3 border-r">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={selectedChat === chat.student_id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleChatSelect(chat.student_id, chat.student_name)}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-medium truncate w-full">{chat.student_name}</span>
                  <span className="text-sm text-muted-foreground truncate w-full">
                    {chat.last_message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(chat.last_message_time), 'MMM d, h:mm a')}
                  </span>
                </div>
                {chat.unread_count > 0 && (
                  <span className="ml-2 shrink-0 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    {chat.unread_count}
                  </span>
                )}
              </Button>
            ))}
            {chats.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No messages yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1">
        {selectedChat ? (
          <ChatMessages
            studentId={selectedChat}
            studentName={selectedStudentName}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a chat to view messages
          </div>
        )}
      </div>
    </div>
  );
} 