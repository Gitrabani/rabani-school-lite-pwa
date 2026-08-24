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
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { count, error: err } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (err) throw err;
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user?.id]);

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
          is_read,
          sender:profiles!sender_id(id, full_name, avatar_url, role),
          recipient:profiles!recipient_id(id, full_name, avatar_url, role)
        `
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Process threads to get unique conversations with unread counts
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
            other_user_role: otherUser?.role || '',
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
      });

      // Calculate unread count per thread
      data?.forEach((msg) => {
        const otherUserId =
          msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const thread = threadMap.get(otherUserId);
        if (thread && msg.recipient_id === user.id && !msg.is_read) {
          thread.unread_count++;
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

        // Update unread count
        await fetchUnreadCount();
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    },
    [user?.id, fetchUnreadCount]
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

        // Refresh threads to update thread list with new message
        await fetchThreads();

        setError(null);
        return data?.[0];
      } catch (err: any) {
        const message = err.message || 'Failed to send message';
        setError(message);
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [user?.id, fetchThreads]
  );

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!user?.id || !threadUserId) return;

    console.log(
      `Setting up real-time subscription for user ${user.id} and thread ${threadUserId}`
    );

    const channel = supabase
      .channel(`messages:${user.id}:${threadUserId}`, {
        config: { broadcast: { self: true } },
      })
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
          // Trigger notification
          playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to message updates');
        }
      });

    return () => {
      console.log(`Unsubscribing from messages:${user.id}:${threadUserId}`);
      supabase.removeChannel(channel);
    };
  }, [user?.id, threadUserId]);

  // Subscribe to unread message changes
  useEffect(() => {
    if (!user?.id) return;

    console.log(`Setting up unread count subscription for user ${user.id}`);

    const channel = supabase
      .channel(`unread:${user.id}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New message for unread count:', payload);
          setUnreadCount((prev) => prev + 1);
          // Also refresh threads to show new message
          fetchThreads();
        }
      )
      .subscribe((status) => {
        console.log(`Unread subscription status: ${status}`);
      });

    return () => {
      console.log(`Unsubscribing from unread:${user.id}`);
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchThreads]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
      );
      audio.play().catch((e) => console.log('Could not play sound:', e));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      fetchThreads();
    }
  }, [user?.id, fetchUnreadCount, fetchThreads]);

  return {
    messages,
    threads,
    loading,
    error,
    unreadCount,
    fetchThreads,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    playNotificationSound,
  };
};
