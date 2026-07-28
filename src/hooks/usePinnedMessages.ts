import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PinnedMessage } from '@/types/messaging';

export const usePinnedMessages = (threadUserId: string) => {
  const { user } = useAuth();
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pinned messages for a thread
  const fetchPinnedMessages = useCallback(async () => {
    if (!user?.id || !threadUserId) return;

    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('pinned_messages')
        .select(
          `
          id,
          message_id,
          thread_user_id,
          pinned_at,
          message:messages(
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            file_url,
            file_name,
            sender:profiles!sender_id(id, full_name, avatar_url),
            recipient:profiles!recipient_id(id, full_name, avatar_url)
          )
        `
        )
        .eq('thread_user_id', threadUserId)
        .order('pinned_at', { ascending: false });

      if (err) throw err;
      setPinnedMessages(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pinned messages');
      console.error('Error fetching pinned messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, threadUserId]);

  // Pin a message
  const pinMessage = useCallback(
    async (messageId: string) => {
      if (!user?.id || !threadUserId) return;

      try {
        const { error: err } = await supabase
          .from('pinned_messages')
          .insert([
            {
              message_id: messageId,
              thread_user_id: threadUserId,
            },
          ]);

        if (err) throw err;
        await fetchPinnedMessages();
      } catch (err: any) {
        setError(err.message || 'Failed to pin message');
        console.error('Error pinning message:', err);
      }
    },
    [user?.id, threadUserId, fetchPinnedMessages]
  );

  // Unpin a message
  const unpinMessage = useCallback(
    async (pinnedMessageId: string) => {
      try {
        const { error: err } = await supabase
          .from('pinned_messages')
          .delete()
          .eq('id', pinnedMessageId);

        if (err) throw err;
        await fetchPinnedMessages();
      } catch (err: any) {
        setError(err.message || 'Failed to unpin message');
        console.error('Error unpinning message:', err);
      }
    },
    [fetchPinnedMessages]
  );

  return {
    pinnedMessages,
    loading,
    error,
    fetchPinnedMessages,
    pinMessage,
    unpinMessage,
  };
};
