// DEPLOY CHECK – IGNORE
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

// A simple, insecure, mock user database stored in local storage.
// DO NOT use this in production.
const getMockUserDb = () => {
  if (typeof window === 'undefined') return {};
  const db = localStorage.getItem('mock_user_db');
  return db ? JSON.parse(db) : {};
};

const saveMockUserDb = (db: any) => {
  localStorage.setItem('mock_user_db', JSON.stringify(db));
};


export default function Home() {
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the form is only rendered on the client, avoiding hydration errors.
    setIsClient(true);
    // Check if user is logged in on component mount
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        loginUser(user.username);
    }
  }, []);

  useEffect(() => {
    // Save chat history whenever messages or the current user changes
    if (currentUser?.username && messages.length > 0) {
      try {
        localStorage.setItem(`chat_history_${currentUser.username}`, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
        toast({
          variant: 'destructive',
          title: 'Could not save history',
          description: 'Your browser\'s storage might be full. Older history might not be saved.',
        });
      }
    }
  }, [messages, currentUser, toast]);

  const loginUser = (username: string) => {
    const sanitizedUsername = username.trim();
    setCurrentUser({ username: sanitizedUsername });
    localStorage.setItem('current_user', JSON.stringify({ username: sanitizedUsername }));

    // Load user's chat history
    const savedMessages = localStorage.getItem(`chat_history_${sanitizedUsername}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${sanitizedUsername}! Welcome back. What would you like to learn about today?`,
        },
      ]);
    }
  };
  
  const handleLogin = (username: string, password: string) => {
    const db = getMockUserDb();
    const userRecord = db[username];

    if (userRecord) {
      // User exists, check password
      if (userRecord.password === password) {
        toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
        loginUser(username);
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password.' });
      }
    } else {
      // User does not exist, register them
      db[username] = { password };
      saveMockUserDb(db);
      toast({ title: "Registration Successful", description: `Welcome, ${username}! Your account has been created.` });
      loginUser(username);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    setMessages([]);
  };

  const handleSendMessage = async (content: string, attachment?: File) => {
    setIsResponding(true);

    const userMessage: Message = { role: 'user', content };
    let attachmentPayload: {dataUri: string; type: string; name: string} | undefined;

    if (attachment) {
      userMessage.attachment = { name: attachment.name, type: attachment.type };
      // Read file as data URI to send to backend
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(attachment);
      });
      attachmentPayload = { dataUri, type: attachment.type, name: attachment.name };
    }

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);

    const historyForAi = newMessages
      .filter((msg, index) => {
        const isFirstAssistantMessage =
          index === 0 &&
          msg.role === 'assistant' &&
          (msg.content.startsWith('Hi ') || msg.content.startsWith('Welcome back'));
        return !isFirstAssistantMessage;
      })
      .map(msg => ({ role: msg.role, content: msg.content })); // Important: strip attachment from history for AI flow

    let result;

  try {
    result = await generateResponse(historyForAi, attachmentPayload);
  } catch (err) {
    console.error(err);
    result = { error: 'AI request failed on server.' };
  }

  setIsResponding(false);

  if (!result || typeof result !== 'object') {
    toast({
      variant: 'destructive',
      title: 'Unexpected error',
      description: 'Invalid response from AI service.',
    });
    return;
  }

  if (result.error) {
    toast({
      variant: 'destructive',
      title: 'An error occurred',
      description: result.error,
    });
    return;
  }

  if (typeof result.response === 'string') {
    setMessages([
      ...newMessages,
      { role: 'assistant', content: result.response },
    ]);
  }

  };

  if (!currentUser) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary dark:to-card">
            <div className='absolute top-4 right-4'>
                <ThemeToggle/>
            </div>
            <header className="w-full max-w-sm mb-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Logo />
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary animate-fade-in-down">
                        Axon
                    </h1>
                    <p className="text-muted-foreground animate-fade-in-up">Your personal AI learning companion.</p>
                </div>
            </header>
            <main className="w-full max-w-xs">
                {isClient ? <UsernameForm onLogin={handleLogin} /> : (
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl shadow-primary/10">
                    <CardHeader className="text-center">
                      <Skeleton className="h-8 w-32 mx-auto" />
                      <Skeleton className="h-4 w-48 mx-auto mt-2" />
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                     </CardContent>
                     <CardFooter>
                       <Skeleton className="h-10 w-full" />
                     </CardFooter>
                  </Card>
                )}
            </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-gradient-to-b from-background via-secondary to-background">
      <header className="w-full max-w-6xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div >
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                    Axon
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {currentUser.username}!</p>
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center mt-4">
        <div className="w-full max-w-6xl flex-1">
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
