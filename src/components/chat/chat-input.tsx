'use client';

import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { Spinner } from '../icons';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSendMessage(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-end gap-2">
      <TextareaAutosize
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask EchoFlow anything..."
        className="flex-1 resize-none rounded-lg p-3 pr-12 text-base border border-border bg-card focus-visible:ring-2 focus-visible:ring-ring"
        maxRows={5}
        autoFocus
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !content.trim()}
        className="absolute right-1.5 bottom-1.5 h-9 w-9"
      >
        {isLoading ? <Spinner className="h-4 w-4" /> : <SendHorizonal className="h-4 w-4" />}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
