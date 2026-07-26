export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
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
