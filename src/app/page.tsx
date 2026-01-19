'use client';

import { useEffect, useState } from 'react';
import { checkApiKey, saveApiKey, generateResponse, deleteApiKey } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/common/logo';
import { ApiKeyForm } from '@/components/chat/api-key-form';
import { ChatView, type Message } from '@/components/chat/chat-view';

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkKey = async () => {
      const hasKey = await checkApiKey();
      setHasApiKey(hasKey);
      if (hasKey) {
        setMessages([
          { role: 'assistant', content: 'What do you want to learn?' },
        ]);
      }
      setIsLoading(false);
    };
    checkKey();
  }, []);

  const handleSaveApiKey = async (apiKey: string) => {
    const result = await saveApiKey(apiKey);
    if (result.success) {
      setHasApiKey(true);
      setMessages([
        { role: 'assistant', content: 'What do you want to learn?' },
      ]);
      toast({
        title: 'Success',
        description: 'API Key saved successfully.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);

    const result = await generateResponse(newMessages);
    
    setIsResponding(false);
    
    if (result.error) {
       toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });

      if(result.isAuthError) {
        await deleteApiKey();
        setHasApiKey(false);
        setMessages([]);
      }
    } else if (result.response) {
      setMessages([...newMessages, { role: 'assistant', content: result.response }]);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            AI Study Buddy
          </h1>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : hasApiKey ? (
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
