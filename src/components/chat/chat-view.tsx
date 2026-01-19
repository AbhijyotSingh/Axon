'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { Bot } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatViewProps {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatView({
  messages,
  isResponding,
  onSendMessage,
}: ChatViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isResponding]);

  return (
    <Card className="w-full h-full flex flex-col shadow-xl">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <CardContent className="p-4 md:p-6">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isResponding && (
            <div className="flex items-start gap-3 my-4">
              <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-3 rounded-2xl rounded-bl-none bg-card text-card-foreground shadow-md">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
      <CardFooter className="p-0 border-t">
        <ChatInput onSendMessage={onSendMessage} isResponding={isResponding} />
      </CardFooter>
    </Card>
  );
}
