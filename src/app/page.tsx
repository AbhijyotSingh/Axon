'use client';

import { useState } from 'react';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';

import { Logo } from '@/components/common/logo';
import { ChatView, type Message } from '@/components/chat/chat-view';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function Home() {
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! What would you like to learn about today?',
    },
  ]);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);

    const historyForAi = newMessages.filter((msg, index) => {
      const isFirstAssistantMessage =
        index === 0 &&
        msg.role === 'assistant' &&
        msg.content.startsWith('Hi there!');
      return !isFirstAssistantMessage;
    });

    const result = await generateResponse(historyForAi);

    setIsResponding(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });
    } else if (result.response) {
      const finalMessages = [
        ...newMessages,
        { role: 'assistant', content: result.response },
      ];
      setMessages(finalMessages);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
              AI Study Buddy
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center mt-4">
        <div className="w-full max-w-3xl flex-1">
          <ChatView
            messages={messages}
            isResponding={isResponding}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>
    </div>
  );
}
