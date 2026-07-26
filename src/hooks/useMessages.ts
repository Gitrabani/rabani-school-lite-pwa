import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageThread } from '@/types/messaging';

export const useMessages = (threadUserId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all message threads for current user
  const fetchThreads = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get all unique conversations
      const { data, error: err } = await supabase
        .from('messages')
        .select(
          `
          sender_id,
          recipient_id,
          content,
          created_at,
          sender:profiles!sender_id(id, full_name, avatar_url),
          recipient:profiles!recipient_id(id, full_name, avatar_url)
        `
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Process threads to get unique conversations
      const threadMap = new Map<string, MessageThread>();

      data?.forEach((msg) => {
        const otherUserId =
          msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const otherUser =
          msg.sender_id === user.id ? msg.recipient : msg.sender;

        if (!threadMap.has(otherUserId)) {
          threadMap.set(otherUserId, {
            other_user_id: otherUserId,
            other_user_name: otherUser?.full_name || 'Unknown',
            other_user_avatar: otherUser?.avatar_url || null,
            other_user_role: '', // Will be fetched separately if needed
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0, // Will be calculated from is_read flag
          });
        }
      });

      setThreads(Array.from(threadMap.values()));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch threads');
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch messages for a specific thread
  const fetchMessages = useCallback(
    async (otherUserId: string) => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('messages')
          .select(
            `
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            is_read,
            sender:profiles!sender_id(id, full_name, avatar_url),
            recipient:profiles!recipient_id(id, full_name, avatar_url)
          `
          )
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true });

        if (err) throw err;

        setMessages(data || []);
        setError(null);

        // Mark messages as read
        await markMessagesAsRead(otherUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (senderId: string) => {
      if (!user?.id) return;

      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', senderId)
          .eq('recipient_id', user.id)
          .eq('is_read', false);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    },
    [user?.id]
  );

  // Send a message
  const sendMessage = useCallback(
    async (recipientId: string, content: string) => {
      if (!user?.id || !content.trim()) return;

      try {
        const { data, error: err } = await supabase
          .from('messages')
          .insert([
            {
              sender_id: user.id,
              recipient_id: recipientId,
              content: content.trim(),
              is_read: false,
            },
          ])
          .select(
            `
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            is_read,
            sender:profiles!sender_id(id, full_name, avatar_url),
            recipient:profiles!recipient_id(id, full_name, avatar_url)
          `
          );

        if (err) throw err;

        // Add new message to the messages list
        if (data && data.length > 0) {
          setMessages((prev) => [...prev, data[0]]);
        }

        setError(null);
        return data?.[0];
      } catch (err: any) {
        const message = err.message || 'Failed to send message';
        setError(message);
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [user?.id]
  );

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!user?.id || !threadUserId) return;

    const channel = supabase
      .channel(`messages:${user.id}:${threadUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},recipient_id=eq.${threadUserId}),and(sender_id=eq.${threadUserId},recipient_id=eq.${user.id}))`,
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, threadUserId]);

  return {
    messages,
    threads,
    loading,
    error,
    fetchThreads,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
  };
};
