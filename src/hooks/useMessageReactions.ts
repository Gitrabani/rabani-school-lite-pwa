import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageReaction } from '@/types/messaging';

export const useMessageReactions = (messageId: string) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reactions for a message
  const fetchReactions = useCallback(async () => {
    if (!messageId) return;

    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('message_reactions')
        .select(
          `
          id,
          message_id,
          user_id,
          emoji,
          created_at,
          user:profiles!user_id(id, full_name)
        `
        )
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (err) throw err;
      setReactions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reactions');
      console.error('Error fetching reactions:', err);
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  // Add reaction to message
  const addReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id || !messageId) return;

      try {
        // Check if user already reacted with this emoji
        const { data: existing } = await supabase
          .from('message_reactions')
          .select('id')
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)
          .single();

        if (existing) {
          // Remove reaction if already exists (toggle)
          await removeReaction(emoji);
          return;
        }

        // Add new reaction
        const { error: err } = await supabase.from('message_reactions').insert([
          {
            message_id: messageId,
            user_id: user.id,
            emoji: emoji,
          },
        ]);

        if (err) throw err;
        await fetchReactions();
      } catch (err: any) {
        setError(err.message || 'Failed to add reaction');
        console.error('Error adding reaction:', err);
      }
    },
    [user?.id, messageId, fetchReactions]
  );

  // Remove reaction from message
  const removeReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id || !messageId) return;

      try {
        const { error: err } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (err) throw err;
        await fetchReactions();
      } catch (err: any) {
        setError(err.message || 'Failed to remove reaction');
        console.error('Error removing reaction:', err);
      }
    },
    [user?.id, messageId, fetchReactions]
  );

  // Subscribe to reaction changes
  useEffect(() => {
    if (!messageId) return;

    const channel = supabase
      .channel(`reactions:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId, fetchReactions]);

  return {
    reactions,
    loading,
    error,
    fetchReactions,
    addReaction,
    removeReaction,
  };
};
