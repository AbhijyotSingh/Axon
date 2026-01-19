'use client';

import { useEffect, useState } from 'react';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/common/logo';
import { ApiKeyForm } from '@/components/chat/api-key-form';
import { ChatView, type Message } from '@/components/chat/chat-view';
import { ThemeToggle } from '@/components/common/theme-toggle';

const API_KEY_SESSION_STORAGE_KEY = 'gemini_api_key';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setMessages([
        { role: 'assistant', content: 'What do you want to learn?' },
      ]);
    }
    setIsLoading(false);
  }, []);

  const handleSaveApiKey = (newApiKey: string) => {
    sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, newApiKey);
    setApiKey(newApiKey);
    setMessages([{ role: 'assistant', content: 'What do you want to learn?' }]);
    toast({
      title: 'Success',
      description: 'API Key saved for this session.',
    });
  };

  const handleResetApiKey = () => {
    sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    setApiKey(null);
    setMessages([]);
    toast({
      title: 'API Key Cleared',
      description: 'Please enter a new API key to continue.',
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'API key not provided.',
      });
      return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);

    // Filter out the initial assistant message before sending to the backend
    const historyForAi = newMessages.filter((msg, index) => {
      // If it's the very first message and it's from the assistant, exclude it.
      return !(index === 0 && msg.role === 'assistant');
    });

    const result = await generateResponse(historyForAi, apiKey);

    setIsResponding(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });

      if (result.isAuthError) {
        sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
        setApiKey(null);
        setMessages([]);
      }
    } else if (result.response) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: result.response },
      ]);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <button onClick={handleResetApiKey} className="text-left">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                AI Study Buddy
              </h1>
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : apiKey ? (
            <ChatView
              messages={messages}
              isResponding={isResponding}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ApiKeyForm onSave={handleSaveApiKey} />
          )}
        </div>
      </main>
    </div>
  );
}
