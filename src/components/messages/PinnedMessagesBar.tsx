import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Pin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PinnedMessage } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';

interface PinnedMessagesBarProps {
  pinnedMessages: PinnedMessage[];
  onUnpin: (pinnedMessageId: string) => void;
  isLoading: boolean;
}

export const PinnedMessagesBar: React.FC<PinnedMessagesBarProps> = ({
  pinnedMessages,
  onUnpin,
  isLoading,
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);

  if (pinnedMessages.length === 0 || !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-b"
      >
        <Pin className="h-4 w-4" />
        {pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? 's' : ''}
      </button>
    );
  }

  return (
    <div className="border-b bg-blue-50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {pinnedMessages.length} Pinned Message{pinnedMessages.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setExpanded(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-24">
        <div className="space-y-1 p-2">
          {pinnedMessages.map((pinned) => (
            <div
              key={pinned.id}
              className="flex items-start justify-between gap-2 p-2 bg-white rounded border text-sm hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-medium">
                  {pinned.message?.sender?.full_name}
                </p>
                <p className="text-xs text-gray-700 truncate">
                  {pinned.message?.content}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(pinned.pinned_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {user?.id === pinned.message?.sender_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0"
                  onClick={() => onUnpin(pinned.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
