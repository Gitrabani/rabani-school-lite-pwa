-- Add new columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size integer;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Create message_read_receipts table for read receipts
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(message_id, reader_id)
);

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone DEFAULT timezone('utc'::text, now() + interval '3 seconds'),
  UNIQUE(user_id, thread_user_id)
);

-- Create indexes
CREATE INDEX idx_message_read_receipts_message_id ON public.message_read_receipts(message_id);
CREATE INDEX idx_typing_indicators_user_id ON public.typing_indicators(user_id);
CREATE INDEX idx_messages_file_url ON public.messages(file_url);

-- Enable RLS for new tables
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for read receipts
CREATE POLICY "Users can view read receipts for their messages"
  ON public.message_read_receipts
  FOR SELECT
  USING (auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
  ) OR auth.uid() = reader_id);

CREATE POLICY "Users can insert read receipts for messages they received"
  ON public.message_read_receipts
  FOR INSERT
  WITH CHECK (auth.uid() = reader_id);

-- RLS Policies for typing indicators
CREATE POLICY "Users can view typing indicators in their conversations"
  ON public.typing_indicators
  FOR SELECT
  USING (auth.uid() = thread_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can insert typing indicators for themselves"
  ON public.typing_indicators
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own typing indicators"
  ON public.typing_indicators
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their typing indicators"
  ON public.typing_indicators
  FOR UPDATE
  USING (auth.uid() = user_id);
