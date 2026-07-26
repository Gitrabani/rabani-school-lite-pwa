import React from 'react';
import { Message } from '@/types/messaging';
import { useAuth } from '@/context/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
}) => {
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSentByUser = message.sender_id === user?.id;
        const sender = isSentByUser ? message.sender : message.recipient;

        return (
          <div
            key={message.id}
            className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-xs lg:max-w-md ${
                isSentByUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={sender?.avatar_url || undefined} />
                <AvatarFallback>
                  {sender?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                className={`${
                  isSentByUser
                    ? 'bg-blue-500 text-white rounded-lg rounded-tr-none'
                    : 'bg-gray-200 text-gray-900 rounded-lg rounded-tl-none'
                } px-3 py-2`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isSentByUser ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
