'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  apiKey: z.string().min(1, 'API Key is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface ApiKeyFormProps {
  onSave: (username: string, apiKey: string) => void;
}

export function ApiKeyForm({ onSave }: ApiKeyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      apiKey: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsSubmitting(true);
    onSave(data.username, data.apiKey);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-primary">
          Welcome to Study Buddy
        </CardTitle>
        <CardDescription>
          Please enter a username and your Gemini API key to start learning. Your chat history will not be saved.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4 pb-0">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                'Start Learning'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
