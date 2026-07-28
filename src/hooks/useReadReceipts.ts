import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useReadReceipts = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Mark message as read by current user
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!user?.id) return;

      try {
        await supabase.from('message_read_receipts').upsert(
          {
            message_id: messageId,
            reader_id: user.id,
            read_at: new Date().toISOString(),
          },
          { onConflict: 'message_id,reader_id' }
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to mark message as read');
        console.error('Error marking message as read:', err);
      }
    },
    [user?.id]
  );

  // Get read receipt count for a message
  const getReadCount = useCallback(async (messageId: string) => {
    try {
      const { count, error: err } = await supabase
        .from('message_read_receipts')
        .select('id', { count: 'exact', head: true })
        .eq('message_id', messageId);

      if (err) throw err;
      return count || 0;
    } catch (err) {
      console.error('Error getting read count:', err);
      return 0;
    }
  }, []);

  return {
    markAsRead,
    getReadCount,
    error,
  };
};
