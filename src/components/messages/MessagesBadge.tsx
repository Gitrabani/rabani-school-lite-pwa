
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import PageHeader from '@/components/shared/PageHeader';
import { Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const MessagesBadge: React.FC = () => {
  const { unreadCount } = useMessages();

  if (unreadCount === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
};

export default MessagesBadge;
