import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageForm } from './MessageForm';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

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
  const { messages, loading, error, fetchMessages, sendMessage } =
    useMessages(userId);

  useEffect(() => {
    fetchMessages(userId);
  }, [userId, fetchMessages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(userId, content);
  };

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
          <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isLoading={loading} />

      {/* Form */}
      <MessageForm onSendMessage={handleSendMessage} isLoading={loading} />
    </div>
  );
};
