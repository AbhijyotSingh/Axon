'use client';

import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isResponding: boolean;
}

export function ChatInput({ onSendMessage, isResponding }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isResponding) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 border-t bg-background p-2"
    >
      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or start a new topic..."
        className="flex-1 resize-none rounded-full border-2 border-input py-2 px-4 shadow-inner focus-visible:ring-primary"
        rows={1}
        disabled={isResponding}
        aria-label="Chat input"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!inputValue.trim() || isResponding}
        className="rounded-full bg-primary hover:bg-primary/90"
        aria-label="Send message"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </form>
  );
}
