import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StudentChatMessages } from './StudentChatMessages';
import { MessageSquare } from 'lucide-react';

interface ChatPreview {
  id: string;
  educator_id: string;
  educator_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface EducatorProfile {
  id: string;
  user_id: string;
  name: string;
}

export function StudentChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [educatorName, setEducatorName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        setLoading(true);
        // Get all messages where the student is either sender or receiver
        const { data: messages, error } = await supabase
          .from("chat_messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching messages:", error);
          setLoading(false);
          return;
        }

        // Process messages to create unique chat previews
        const chatMap = new Map<string, ChatPreview>();

        for (const message of messages) {
          // Determine if the educator is sender or receiver
          const isEducatorSender = message.sender_id !== user.id;
          const educatorId = isEducatorSender ? message.sender_id : message.receiver_id;
          
          // Skip if we've already processed this educator's chat
          if (chatMap.has(educatorId)) {
            const existingChat = chatMap.get(educatorId)!;
            // Update unread count if message is unread and sent by educator
            if (isEducatorSender && !message.read_at && message.receiver_id === user.id) {
              existingChat.unread_count += 1;
            }
            continue;
          }

          // Get educator name from profile
          let educatorName = "Educator";
          // Fetch educator profile for the user ID
          const { data: educatorProfile, error: profileError } = await supabase
            .from("educator_profiles")
            .select("name")
            .eq("user_id", educatorId)
            .single();

          if (!profileError && educatorProfile) {
            educatorName = educatorProfile.name;
          }

          // Count unread messages
          const unreadCount = isEducatorSender && !message.read_at && message.receiver_id === user.id ? 1 : 0;

          // Create chat preview
          chatMap.set(educatorId, {
            id: educatorId,
            educator_id: educatorId,
            educator_name: educatorName,
            last_message: message.content,
            last_message_time: format(new Date(message.created_at), "MMM d, h:mm a"),
            unread_count: unreadCount,
          });
        }

        // Convert map to array and sort by last message time (newest first)
        const chatPreviews = Array.from(chatMap.values());
        setChats(chatPreviews);
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchChats:", error);
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to new messages
    const channel = supabase
      .channel("student_chat_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          fetchChats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleChatSelect = async (educatorId: string, educatorName: string) => {
    setSelectedChat(educatorId);
    setEducatorName(educatorName);

    // Mark all messages from this educator as read
    if (user) {
      const { error } = await supabase
        .from("chat_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", educatorId)
        .eq("receiver_id", user.id)
        .is("read_at", null);

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        // Broadcast message read update
        await supabase.channel("broadcast").send({
          type: "broadcast",
          event: "message_read",
          payload: { user_id: user.id, educator_id: educatorId },
        });

        // Update local chat state to reflect read messages
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.educator_id === educatorId ? { ...chat, unread_count: 0 } : chat
          )
        );
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[400px] gap-4 border rounded-lg overflow-hidden">
      <div className={`w-full ${selectedChat ? "md:w-1/3" : "md:w-full"} border-r`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Conversations</h3>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No conversations yet.</p>
              <p className="text-sm">Message an educator to start chatting.</p>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className={`w-full justify-between items-start p-4 h-auto rounded-none ${
                    selectedChat === chat.educator_id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleChatSelect(chat.educator_id, chat.educator_name)}
                >
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{chat.educator_name}</div>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {chat.last_message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {chat.last_message_time}
                    </span>
                    {chat.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedChat && (
        <div className="w-full md:w-2/3">
          <StudentChatMessages 
            educatorId={selectedChat} 
            educatorName={educatorName} 
          />
        </div>
      )}
    </div>
  );
} 