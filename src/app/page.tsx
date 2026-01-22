'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { createChatSession, getChatsListener, updateChatSession, type ChatSession } from '@/firebase/firestore/chats';
import { signOutUser } from '@/firebase/auth/auth';

import { Logo } from '@/components/common/logo';
import { ChatView, type Message } from '@/components/chat/chat-view';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';


export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const unsubscribe = getChatsListener(firestore, user.uid, (chats) => {
        if (chats.length > 0) {
          const mostRecentChat = chats[0];
          setCurrentChatId(mostRecentChat.id);
          setMessages(mostRecentChat.history || []);
        } else {
          // No chats found, create a new one
          const createNewChat = async () => {
              const newChatId = await createChatSession(firestore, user.uid);
              if (newChatId) {
                  setCurrentChatId(newChatId);
                  setMessages([{ role: 'assistant', content: "Hi there! What would you like to learn about today?" }]);
              }
          }
          createNewChat();
        }
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);
  
  useEffect(() => {
    if (user && firestore && currentChatId && messages.length > 0) {
      updateChatSession(firestore, user.uid, currentChatId, messages);
    }
  }, [messages, user, firestore, currentChatId]);

  const handleSendMessage = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);

    const historyForAi = newMessages.filter((msg, index) => {
        const isFirstAssistantMessage = index === 0 && msg.role === 'assistant' && msg.content.startsWith("Hi there!");
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

  const handleLogout = async () => {
    if (!auth) return;
    await signOutUser(auth);
    router.push('/login');
  }

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email?.split('@')[0]}
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
