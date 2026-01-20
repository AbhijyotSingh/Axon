'use client';

import { useEffect, useState } from 'react';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/common/logo';
import { ApiKeyForm } from '@/components/chat/api-key-form';
import { ChatView, type Message } from '@/components/chat/chat-view';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

const API_KEY_SESSION_STORAGE_KEY = 'gemini_api_key';
const USERNAME_SESSION_STORAGE_KEY = 'study_buddy_username';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
    const storedUsername = sessionStorage.getItem(USERNAME_SESSION_STORAGE_KEY);
    if (storedKey && storedUsername) {
      setApiKey(storedKey);
      setUsername(storedUsername);
      setMessages([
        { role: 'assistant', content: `Hi ${storedUsername}! What do you want to learn?` },
      ]);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newUsername: string, newApiKey: string) => {
    sessionStorage.setItem(USERNAME_SESSION_STORAGE_KEY, newUsername);
    sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, newApiKey);
    setUsername(newUsername);
    setApiKey(newApiKey);
    setMessages([{ role: 'assistant', content: `Hi ${newUsername}! What do you want to learn?` }]);
    toast({
      title: 'Success',
      description: 'You are now logged in for this session.',
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(USERNAME_SESSION_STORAGE_KEY);
    setApiKey(null);
    setUsername(null);
    setMessages([]);
    toast({
      title: 'Logged Out',
      description: 'Please log in to start a new session.',
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

    const historyForAi = newMessages.filter((msg, index) => {
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
        handleLogout();
      }
    } else if (result.response) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: result.response },
      ]);
    }
  };
  
  const isLoggedIn = !!(apiKey && username);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <button onClick={handleLogout} className="text-left">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                AI Study Buddy
              </h1>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Logged in
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isLoggedIn ? (
            <ChatView
              messages={messages}
              isResponding={isResponding}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ApiKeyForm onSave={handleLogin} />
          )}
        </div>
      </main>
    </div>
  );
}
