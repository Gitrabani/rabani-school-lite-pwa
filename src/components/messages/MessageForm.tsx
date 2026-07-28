import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadMessageFile, formatFileSize } from '@/utils/fileUpload';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface MessageFormProps {
  onSendMessage: (content: string, fileData?: { url: string; name: string; size: number }) => Promise<void>;
  recipientId: string;
  isLoading?: boolean;
}

export const MessageForm: React.FC<MessageFormProps> = ({
  onSendMessage,
  recipientId,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { broadcastTyping, clearTyping } = useTypingIndicator(recipientId);

  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing
    broadcastTyping();

    // Clear typing status after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      clearTyping();
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `File size must be less than 10MB. Your file is ${formatFileSize(file.size)}.`,
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Empty message',
        description: 'Please type a message or select a file',
      });
      return;
    }

    setIsSending(true);
    try {
      let fileData;

      // Upload file if selected
      if (selectedFile && user?.id) {
        setIsUploading(true);
        fileData = await uploadMessageFile(user.id, selectedFile);
      }

      await onSendMessage(message.trim(), fileData);
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await clearTyping();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: error.message || 'An error occurred',
      });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white space-y-3">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            Remove
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || isLoading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          disabled={isSending || isLoading || isUploading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSending || isLoading || isUploading || (!message.trim() && !selectedFile)}
          size="icon"
        >
          {isUploading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
