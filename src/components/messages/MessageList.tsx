import React, { useState } from 'react';
import { Message } from '@/types/messaging';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Download, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, getFileIcon } from '@/utils/fileUpload';
import { supabase } from '@/integrations/supabase/client';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onMessageUpdate?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onMessageUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message updated',
      });

      setEditingId(null);
      onMessageUpdate?.(messageId);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to edit message',
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message deleted',
      });

      onMessageUpdate?.(messageId);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete message',
      });
    }
  };

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
      {messages
        .filter((m) => !m.deleted_at)
        .map((message) => {
          const isSentByUser = message.sender_id === user?.id;
          const sender = isSentByUser ? message.sender : message.recipient;
          const isEditing = editingId === message.id;

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

                <div className="flex flex-col gap-1">
                  <div
                    className={`${
                      isSentByUser
                        ? 'bg-blue-500 text-white rounded-lg rounded-tr-none'
                        : 'bg-gray-200 text-gray-900 rounded-lg rounded-tl-none'
                    } px-3 py-2`}
                  >
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-sm h-7"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleEdit(message.id, editText)
                          }
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm break-words">{message.content}</p>
                        {message.edited_at && (
                          <p className="text-xs opacity-75 mt-1">
                            (edited)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Attachment */}
                  {message.file_url && !isEditing && (
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        isSentByUser
                          ? 'bg-blue-400 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{getFileIcon(message.file_name || '')}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">
                          {message.file_name}
                        </p>
                        <p className="text-xs opacity-75">
                          {formatFileSize(message.file_size || 0)}
                        </p>
                      </div>
                      <Download className="h-4 w-4 flex-shrink-0" />
                    </a>
                  )}

                  {/* Timestamp and Actions */}
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      isSentByUser
                        ? 'text-blue-100 justify-end'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {isSentByUser && !isEditing && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => {
                            setEditingId(message.id);
                            setEditText(message.content);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};
