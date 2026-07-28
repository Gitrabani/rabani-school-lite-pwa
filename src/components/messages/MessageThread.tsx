import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageForm } from './MessageForm';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MessageThreadProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
  onBack?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  userId,
  userName,
  userAvatar,
  onBack,
}) => {
  const { user } = useAuth();
  const { messages, loading, error, fetchMessages, sendMessage } =
    useMessages(userId);
  const { typingUsers } = useTypingIndicator(userId);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchMessages(userId);
  }, [userId, fetchMessages]);

  const handleSendMessage = async (
    content: string,
    fileData?: { url: string; name: string; size: number }
  ) => {
    try {
      // Insert message with file data if present
      const { error: err } = await supabase.from('messages').insert([
        {
          sender_id: user?.id,
          recipient_id: userId,
          content: content,
          file_url: fileData?.url,
          file_name: fileData?.name,
          file_size: fileData?.size,
          is_read: false,
        },
      ]);

      if (err) throw err;

      // Refresh messages
      await fetchMessages(userId);
    } catch (error: any) {
      throw error;
    }
  };

  // Fetch user profiles for typing indicators
  useEffect(() => {
    if (typingUsers.length > 0) {
      const fetchProfiles = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', typingUsers);
        
        const profileMap: Record<string, any> = {};
        data?.forEach((profile) => {
          profileMap[profile.id] = profile;
        });
        setUserProfiles(profileMap);
      };

      fetchProfiles();
    }
  }, [typingUsers]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar>
          <AvatarImage src={userAvatar || undefined} />
          <AvatarFallback>{userName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{userName}</h3>
          {typingUsers.length > 0 ? (
            <p className="text-xs text-blue-600 font-medium">
              {typingUsers.map((id) => userProfiles[id]?.full_name || 'User').join(', ')} typing...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Active now</p>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={loading}
        onMessageUpdate={() => fetchMessages(userId)}
      />

      {/* Form */}
      <MessageForm
        onSendMessage={handleSendMessage}
        recipientId={userId}
        isLoading={loading}
      />
    </div>
  );
};
