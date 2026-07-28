export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  edited_at?: string | null;
  deleted_at?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  reactions?: MessageReaction[];
  pinned_at?: string | null;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  recipient?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
  };
}

export interface PinnedMessage {
  id: string;
  message_id: string;
  thread_user_id: string;
  pinned_at: string;
  message?: Message;
}

export interface MessageThread {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  other_user_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface MessageInput {
  recipient_id: string;
  content: string;
}
