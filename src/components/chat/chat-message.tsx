'use client';

import { Bot, User, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from './chat-view';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex items-start gap-3', isUser && 'justify-end')}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary text-primary-foreground shrink-0">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'p-3 rounded-xl max-w-[80%] shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none border'
        )}
      >
        {message.attachment && (
            <div className={cn(
                "mb-2 flex items-center gap-2 rounded-lg border p-2",
                isUser ? "border-primary-foreground/20 bg-primary/80" : "bg-muted/50"
            )}>
                <File className={cn("h-4 w-4 shrink-0", isUser ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className={cn("text-sm truncate", isUser ? "text-primary-foreground" : "text-muted-foreground")}>{message.attachment.name}</span>
            </div>
        )}
        {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-accent text-accent-foreground shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
