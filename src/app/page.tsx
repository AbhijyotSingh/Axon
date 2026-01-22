'use client';

import { useState, useEffect } from 'react';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';

import { Logo } from '@/components/common/logo';
import { ChatView, type Message } from '@/components/chat/chat-view';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { UsernameForm } from '@/components/common/username-form';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('chat_username');
    if (storedUsername) {
      handleSetUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username && messages.length > 0) {
      try {
        localStorage.setItem(`chat_history_${username}`, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
        toast({
          variant: 'destructive',
          title: 'Could not save history',
          description: 'Your browser\'s storage might be full. Older history might not be saved.',
        });
      }
    }
  }, [messages, username, toast]);

  const handleSetUsername = (newUsername: string) => {
    const sanitizedUsername = newUsername.trim();
    setUsername(sanitizedUsername);
    localStorage.setItem('chat_username', sanitizedUsername);
    const savedMessages = localStorage.getItem(`chat_history_${sanitizedUsername}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${sanitizedUsername}! What would you like to learn about today?`,
        },
      ]);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    if (username) {
        localStorage.removeItem(`chat_history_${username}`);
    }
    setUsername(null);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);

    const historyForAi = newMessages.filter((msg, index) => {
      const isFirstAssistantMessage =
        index === 0 &&
        msg.role === 'assistant' &&
        msg.content.startsWith('Hi ');
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

  if (!username) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background">
            <div className='absolute top-4 right-4'>
                <ThemeToggle/>
            </div>
            <header className="w-full max-w-sm mb-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Logo />
                    <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                        AI Study Buddy
                    </h1>
                </div>
            </header>
            <main className="w-full max-w-xs">
                <UsernameForm onSetUsername={handleSetUsername} />
            </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div >
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                    AI Study Buddy
                </h1>
                <p className="text-sm text-muted-foreground">Welcome, {username}!</p>
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
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
