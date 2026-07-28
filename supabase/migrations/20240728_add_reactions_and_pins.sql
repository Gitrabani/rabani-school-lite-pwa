-- Create message_reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(message_id, user_id, emoji)
);

-- Create pinned_messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  thread_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(message_id, thread_user_id)
);

-- Create indexes
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX idx_pinned_messages_thread ON public.pinned_messages(thread_user_id);
CREATE INDEX idx_pinned_messages_message ON public.pinned_messages(message_id);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions on messages they can see"
  ON public.message_reactions
  FOR SELECT
  USING (auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
    UNION
    SELECT recipient_id FROM messages WHERE id = message_id
  ));

CREATE POLICY "Users can add reactions to messages"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
    UNION
    SELECT recipient_id FROM messages WHERE id = message_id
  ));

CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pinned_messages
CREATE POLICY "Users can view pinned messages in their conversations"
  ON public.pinned_messages
  FOR SELECT
  USING (auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
    UNION
    SELECT recipient_id FROM messages WHERE id = message_id
  ));

CREATE POLICY "Users can pin messages in their conversations"
  ON public.pinned_messages
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
    UNION
    SELECT recipient_id FROM messages WHERE id = message_id
  ));

CREATE POLICY "Users can unpin messages in their conversations"
  ON public.pinned_messages
  FOR DELETE
  USING (auth.uid() IN (
    SELECT sender_id FROM messages WHERE id = message_id
    UNION
    SELECT recipient_id FROM messages WHERE id = message_id
  ));
