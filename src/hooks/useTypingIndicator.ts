import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useTypingIndicator = (otherUserId: string) => {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Broadcast typing status
  const broadcastTyping = useCallback(async () => {
    if (!user?.id || !otherUserId) return;

    try {
      await supabase.from('typing_indicators').upsert(
        {
          user_id: user.id,
          thread_user_id: otherUserId,
          expires_at: new Date(Date.now() + 3000).toISOString(),
        },
        { onConflict: 'user_id,thread_user_id' }
      );
    } catch (err) {
      console.error('Error broadcasting typing:', err);
    }
  }, [user?.id, otherUserId]);

  // Clear typing status
  const clearTyping = useCallback(async () => {
    if (!user?.id || !otherUserId) return;

    try {
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('thread_user_id', otherUserId);
    } catch (err) {
      console.error('Error clearing typing:', err);
    }
  }, [user?.id, otherUserId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!user?.id || !otherUserId) return;

    const channel = supabase
      .channel(`typing:${user.id}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `thread_user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setTypingUsers((prev) => {
              const typingList = Array.from(
                new Set([...prev, (payload.new as any).user_id])
              );
              return typingList;
            });
          } else if (payload.eventType === 'DELETE') {
            setTypingUsers((prev) =>
              prev.filter((id) => id !== (payload.old as any).user_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, otherUserId]);

  return {
    broadcastTyping,
    clearTyping,
    typingUsers,
  };
};
