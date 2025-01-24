import { useState, useEffect } from 'react';
import { RecruiterNavbar } from '@/components/recruiter/RecruiterNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender: {
    name: string;
  };
  receiver: {
    name: string;
  };
}

interface Conversation {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        // Fetch all messages where user is either sender or receiver
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(name),
            receiver:receiver_id(name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by conversation
        const conversationsMap = new Map<string, Conversation>();
        data?.forEach(message => {
          const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
          const otherUserName = message.sender_id === user.id ? message.receiver.name : message.sender.name;

          if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, {
              user_id: otherUserId,
              user_name: otherUserName,
              last_message: message.content,
              last_message_time: message.created_at,
              unread_count: message.receiver_id === user.id && !message.read ? 1 : 0
            });
          } else if (message.receiver_id === user.id && !message.read) {
            const conv = conversationsMap.get(otherUserId)!;
            conv.unread_count++;
          }
        });

        setConversations(Array.from(conversationsMap.values()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Could not load conversations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(name),
            receiver:receiver_id(name)
          `)
          .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user?.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data || []);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', user?.id)
          .eq('sender_id', selectedUser);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user?.id,
            receiver_id: selectedUser,
            content: newMessage,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      setNewMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(name),
          receiver:receiver_id(name)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <RecruiterNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading messages...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RecruiterNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Conversations List */}
          <div className="col-span-4">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user_id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedUser === conversation.user_id ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                      onClick={() => setSelectedUser(conversation.user_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{conversation.user_name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.last_message_time).toLocaleDateString()}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="col-span-8">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader>
                <CardTitle>
                  {selectedUser
                    ? conversations.find(c => c.user_id === selectedUser)?.user_name
                    : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              {selectedUser && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
