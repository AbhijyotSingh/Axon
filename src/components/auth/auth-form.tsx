'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInWithEmail } from '@/firebase/auth/auth';

const usernameSchema = z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or less.');

const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      const email = `${data.username.toLowerCase()}@studybuddy.local`;
      await signInWithEmail(auth, email, data.password);
      toast({ title: 'Login Successful!' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: "Invalid username or password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
        <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4 pt-6">
                    <FormField control={loginForm.control} name="username" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl><Input placeholder="your-username" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
