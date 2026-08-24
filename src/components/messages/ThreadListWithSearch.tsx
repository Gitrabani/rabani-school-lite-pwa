import React, { useState } from 'react';
import { MessageThread } from '@/types/messaging';
import { Input } from '@/components/ui/input';
import { Search, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewMessageDialog } from './NewMessageDialog';

interface ThreadListProps {
  threads: MessageThread[];
  onSelectThread: (thread: MessageThread) => void;
  selectedThreadId?: string;
  isLoading: boolean;
}

export const ThreadListWithSearch: React.FC<ThreadListProps> = ({
  threads,
  onSelectThread,
  selectedThreadId,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

  const filteredThreads = threads.filter((thread) =>
    thread.other_user_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    thread.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewMessage = (thread: MessageThread) => {
    onSelectThread(thread);
    setShowNewMessageDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Message Button */}
      <div className="p-3 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-0.5 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowNewMessageDialog(true)}
          title="Start new conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading conversations...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <button
              key={thread.other_user_id}
              onClick={() => onSelectThread(thread)}
              className={`w-full p-3 rounded-lg border transition-colors text-left ${
                selectedThreadId === thread.other_user_id
                  ? 'bg-blue-50 border-blue-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                  {thread.other_user_name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">
                      {thread.other_user_name}
                    </h4>
                    {thread.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex-shrink-0">
                        {thread.unread_count > 99 ? '99+' : thread.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {thread.last_message}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={showNewMessageDialog}
        onOpenChange={setShowNewMessageDialog}
        onSelectUser={handleNewMessage}
      />
    </div>
  );
};
