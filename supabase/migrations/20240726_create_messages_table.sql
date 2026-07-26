-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sender_not_recipient CHECK (sender_id != recipient_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id, created_at);
CREATE INDEX idx_messages_recipient_unread ON public.messages(recipient_id, is_read, created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view messages they sent or received
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to insert messages they're sending
CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to update the is_read status of messages they received
CREATE POLICY "Users can mark messages as read"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);
