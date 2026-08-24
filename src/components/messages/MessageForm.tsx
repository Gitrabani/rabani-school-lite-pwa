import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageFormProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export const MessageForm: React.FC<MessageFormProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty message',
        description: 'Please type a message before sending',
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending message:', message);
      await onSendMessage(message);
      setMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message was sent successfully',
      });
    } catch (error: any) {
      console.error('Message send error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: error.message || 'An error occurred',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending || isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSending || isLoading || !message.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
