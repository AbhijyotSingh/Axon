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

const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'API Key is required.'),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface ApiKeyFormProps {
  onSave: (apiKey: string) => Promise<void>;
}

export function ApiKeyForm({ onSave }: ApiKeyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
    },
  });

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsSubmitting(true);
    await onSave(data.apiKey);
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary">
          Welcome to Study Buddy
        </CardTitle>
        <CardDescription>
          Please enter your Gemini API key to continue learning.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
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
                'Save and Start Learning'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
