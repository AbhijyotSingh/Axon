'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  FormMessage,
} from '@/components/ui/form';

const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or less.'),
});

interface UsernameFormProps {
  onSetUsername: (username: string) => void;
}

export function UsernameForm({ onSetUsername }: UsernameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: '' },
  });

  const onSubmit = (data: z.infer<typeof usernameSchema>) => {
    setIsSubmitting(true);
    onSetUsername(data.username);
    // Component will unmount, no need to setIsSubmitting(false)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
        <CardDescription>
          Enter a username to start chatting. Your history will be saved on this device.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="e.g. study_master_42"
                      {...field}
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Starting...' : 'Start Chatting'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
