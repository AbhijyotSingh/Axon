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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmail, signUpWithEmail } from '@/firebase/auth/auth';


const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const registerSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: ''},
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      await signInWithEmail(auth, data.email, data.password);
      toast({ title: 'Login Successful!' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
        if (!auth || !firestore) throw new Error("Firebase services not available");
        await signUpWithEmail(auth, firestore, data.email, data.password);
        toast({ title: 'Registration Successful!' });
        router.push('/');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4 pt-6">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
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
      </TabsContent>
      <TabsContent value="register">
        <Card>
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4 pt-6">
                         <FormField control={registerForm.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                             {isSubmitting ? 'Registering...' : 'Create Account'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
