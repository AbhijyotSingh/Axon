'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { Bot } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: {
    name: string;
    type: string;
  };
}

interface ChatViewProps {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (content: string, attachment?: File) => void;
}

export function ChatView({
  messages,
  isResponding,
  onSendMessage,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResponding]);

  return (
    <Card className="w-full h-full flex flex-col shadow-2xl shadow-primary/10 bg-card/90 backdrop-blur-sm border-border/50">
      <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isResponding && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-3 rounded-xl rounded-bl-none bg-card text-card-foreground border">
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-2 border-t">
        <ChatInput onSendMessage={onSendMessage} isResponding={isResponding} />
      </CardFooter>
    </Card>
  );
}
