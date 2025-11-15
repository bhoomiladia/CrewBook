// app/dashboard/chat/components/MessageItem.tsx
'use client'

import { Message } from '@/hooks/data/useProjectMessages';
import { UserProfileWithId } from '@/hooks/data/useProjectMembers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Assumes you have cn from shadcn

interface Props {
  message: Message;
  sender: UserProfileWithId | undefined;
  isOwnMessage: boolean;
}

export function MessageItem({ message, sender, isOwnMessage }: Props) {
  const senderName = sender?.displayName || sender?.email || 'Unknown';
  
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isOwnMessage && 'flex-row-reverse' // Align to right if your message
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender?.photoURL} />
        <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'p-3 rounded-lg max-w-xs',
          isOwnMessage
            ? 'bg-primary text-primary-foreground' // Your color
            : 'bg-muted' // Other's color
        )}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold mb-1">
            {senderName.split(' ')[0]}
          </p>
        )}
        <p className="text-sm">{message.text}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {message.createdAt?.toDate().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}