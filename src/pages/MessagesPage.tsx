import React, { useEffect } from 'react';
import { ThreadListWithSearch } from '@/components/messages/ThreadListWithSearch';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageThreadType } from '@/types/messaging';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

const MessagesPage: React.FC = () => {
  const [selectedThread, setSelectedThread] =
    useState<MessageThreadType | null>(null);
  const [showThreadList, setShowThreadList] = useState(true);
  const { threads, loading, fetchThreads, unreadCount } = useMessages();
  const { toast } = useToast();

  useEffect(() => {
    fetchThreads();
    // Refresh threads every 30 seconds
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  const handleSelectThread = (thread: MessageThreadType) => {
    setSelectedThread(thread);
    setShowThreadList(false);
  };

  const handleBack = () => {
    setSelectedThread(null);
    setShowThreadList(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title={`Messages ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
        description="Chat with parents and teachers"
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Thread List - Desktop Always Visible, Mobile Only When No Selection */}
        {(showThreadList || window.innerWidth >= 768) && (
          <div
            className={`${
              showThreadList && window.innerWidth < 768
                ? 'col-span-1'
                : 'md:col-span-1'
            } border rounded-lg bg-white overflow-hidden`}
          >
            <ThreadListWithSearch
              threads={threads}
              onSelectThread={handleSelectThread}
              selectedThreadId={selectedThread?.other_user_id}
              isLoading={loading}
            />
          </div>
        )}

        {/* Message Thread - Desktop Shows Alongside, Mobile Replaces List */}
        {(selectedThread || window.innerWidth >= 768) && (
          <div
            className={`${
              showThreadList && window.innerWidth < 768
                ? 'hidden'
                : 'md:col-span-2'
            } col-span-1`}
          >
            {selectedThread ? (
              <MessageThread
                userId={selectedThread.other_user_id}
                userName={selectedThread.other_user_name}
                userAvatar={selectedThread.other_user_avatar}
                onBack={handleBack}
              />
            ) : (
              <div className="border rounded-lg bg-white h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
export default MessagesPage;
