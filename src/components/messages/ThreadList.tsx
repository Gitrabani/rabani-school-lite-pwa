import React, { useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageThread as MessageThreadType } from '@/types/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ThreadListProps {
  onSelectThread: (thread: MessageThreadType) => void;
  selectedThreadId?: string;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  onSelectThread,
  selectedThreadId,
}) => {
  const { threads, loading, fetchThreads } = useMessages();

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  if (loading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="text-center">
          <p>No conversations yet</p>
          <p className="text-sm">Start by sending a message to someone</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <button
          key={thread.other_user_id}
          onClick={() => onSelectThread(thread)}
          className={`w-full p-3 rounded-lg border transition-colors ${
            selectedThreadId === thread.other_user_id
              ? 'bg-blue-50 border-blue-300'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={thread.other_user_avatar || undefined} />
              <AvatarFallback>
                {thread.other_user_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm truncate">
                  {thread.other_user_name}
                </h4>
                <p className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(thread.last_message_at), {
                    addSuffix: false,
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {thread.last_message}
              </p>
            </div>

            {thread.unread_count > 0 && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                {thread.unread_count}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
