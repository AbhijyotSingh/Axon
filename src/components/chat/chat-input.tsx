'use client';

import { useState, useRef } from 'react';
import { SendHorizontal, Paperclip, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (content: string, attachment?: File) => void;
  isResponding: boolean;
}

export function ChatInput({ onSendMessage, isResponding }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      // You can add validation for file type and size here if needed
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((inputValue.trim() || attachment) && !isResponding) {
      onSendMessage(inputValue.trim(), attachment ?? undefined);
      setInputValue('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
       {attachment && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-sm">
          <div className="flex items-center gap-2 overflow-hidden">
             <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{attachment.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleRemoveAttachment}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="relative w-full"
      >
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={attachment ? 'Add a comment to your file...' : 'Ask a question or start a new topic...'}
          className="w-full resize-none rounded-2xl border-input bg-card py-3 px-4 shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 min-h-0 h-12 pr-24"
          rows={1}
          disabled={isResponding}
          aria-label="Chat input"
        />
         <div className="absolute top-1/2 right-2.5 -translate-y-1/2 flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,.txt,.md"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isResponding}
              aria-label="Attach file"
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={(!inputValue.trim() && !attachment) || isResponding}
              className="rounded-full bg-primary hover:bg-primary/90 h-9 w-9 shrink-0"
              aria-label="Send message"
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
        </div>
      </form>
    </div>
  );
}
