import React, { useState } from 'react';
import { ThreadList } from '@/components/messages/ThreadList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageThreadType } from '@/types/messaging';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const [selectedThread, setSelectedThread] =
    useState<MessageThreadType | null>(null);
  const [showThreadList, setShowThreadList] = useState(true);

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
        title="Messages"
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
            } border rounded-lg bg-white p-4 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Conversations</h2>
              {selectedThread && window.innerWidth < 768 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            <ThreadList
              onSelectThread={handleSelectThread}
              selectedThreadId={selectedThread?.other_user_id}
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

export default MessagesPage;
