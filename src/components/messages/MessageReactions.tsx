import React from 'react';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus, Smile } from 'lucide-react';

const EMOJI_REACTIONS = ['👍', '😂', '❤️', '😮', '😢', '🔥', '✨'];

interface MessageReactionsProps {
  messageId: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
}) => {
  const { user } = useAuth();
  const { reactions, addReaction } = useMessageReactions(messageId);
  const [showPicker, setShowPicker] = React.useState(false);

  // Group reactions by emoji
  const reactionGroups = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    },
    {} as Record<string, typeof reactions>
  );

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Display existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => {
        const userReacted = reactionList.some((r) => r.user_id === user?.id);
        return (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              userReacted
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={reactionList.map((r) => r.user?.full_name).join(', ')}
          >
            <span>{emoji}</span>
            <span>{reactionList.length}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  addReaction(emoji);
                  setShowPicker(false);
                }}
                className="flex items-center justify-center h-10 w-10 rounded hover:bg-gray-100 text-xl transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
