'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { generateResponse } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/common/logo';
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
import { LogOut, PlusCircle } from 'lucide-react';
import {
  getChatsListener,
  createChatSession,
  updateChatSession,
  type ChatSession,
} from '@/firebase/firestore/chats';
import { signOutUser } from '@/firebase/auth/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const unsubscribe = getChatsListener(firestore, user.uid, (sessions) => {
        setChatSessions(sessions);
        if (sessions.length > 0 && !activeChatId) {
            const latestSession = sessions[0];
            setActiveChatId(latestSession.id);
            setMessages(latestSession.history);
        } else if (sessions.length === 0) {
            handleNewChat();
        }
      });
      return () => unsubscribe();
    }
  }, [user, firestore, activeChatId]);

  const handleLogout = async () => {
    try {
        await signOutUser(auth);
        router.push('/login');
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
    }
  };
  
  const handleNewChat = async () => {
    if (!user || !firestore) return;
    const newChatId = await createChatSession(firestore, user.uid);
    if(newChatId) {
      setActiveChatId(newChatId);
      setMessages([{ role: 'assistant', content: "Hi there! What would you like to learn about today?" }]);
    }
  }
  
  const handleSelectChat = (chatId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setActiveChatId(session.id);
      setMessages(session.history.length > 0 ? session.history : [{ role: 'assistant', content: "Hi there! What would you like to learn about today?" }]);
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!activeChatId || !user || !firestore) {
        // If there's no active chat, create one first.
        if (user && firestore) {
          const newId = await createChatSession(firestore, user.uid);
          if (newId) {
            setActiveChatId(newId);
            const newMessages: Message[] = [{ role: 'user', content }];
            setMessages(newMessages);
            setIsResponding(true);
            // Now call generate response and update logic
            await continueSendingMessage(content, newId, newMessages);
          }
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to start a chat.' });
        }
        return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsResponding(true);
    await continueSendingMessage(content, activeChatId, newMessages);
  };
  
  const continueSendingMessage = async (content: string, chatId: string, currentMessages: Message[]) => {
     if (!user || !firestore) return;

      const historyForAi = currentMessages.filter((msg, index) => {
          const isFirstAssistantMessage = index === 0 && msg.role === 'assistant';
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
          ...currentMessages,
          { role: 'assistant', content: result.response },
        ];
        setMessages(finalMessages);
        updateChatSession(firestore, user.uid, chatId, finalMessages);
      }
  }

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
  }

  const username = (user.email && user.email.split('@')[0]) || 'User';

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
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 w-full">
            <Select onValueChange={handleSelectChat} value={activeChatId || ''}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a chat" />
                </SelectTrigger>
                <SelectContent>
                    {chatSessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                            Chat from {new Date(session.createdAt?.toDate()).toLocaleString()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleNewChat}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Chat
            </Button>
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
