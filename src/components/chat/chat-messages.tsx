'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo, Spinner } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { RefreshCw, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessagesProps {
  messages: Message[];
  user: User;
  isLoading: boolean;
  onRetry: (content: string, isRetry: boolean, messageId: string) => void;
}

export function ChatMessages({ messages, user, isLoading, onRetry }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  const handleEditSubmit = (messageId: string) => {
    onRetry(editingContent, true, messageId);
    setEditingMessageId(null);
    setEditingContent('');
  }

  const isLastUserMessage = (index: number) => {
    return messages[index].role === 'user' && (index === messages.length - 1 || messages[index + 1]?.role !== 'user');
  }

  return (
    <ScrollArea ref={scrollRef} className="h-full">
      <div className="p-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-4',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Logo className="h-5 w-5" />
                </div>
              </Avatar>
            )}

            <div
              className={cn(
                'max-w-xl rounded-lg px-4 py-2 break-words',
                message.role === 'user'
                  ? 'bg-primary/90 text-primary-foreground'
                  : 'bg-muted',
                { 'border-destructive border': message.isFailed }
              )}
            >
              {editingMessageId === message.id ? (
                 <div className="space-y-2">
                    <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full text-foreground"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleEditSubmit(message.id)}>Save</Button>
                    </div>
                </div>
              ) : (
                <article className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </article>
              )}
               {message.isFailed && (
                <div className="mt-2 flex items-center gap-2 text-destructive text-xs">
                  <span>Message failed to send.</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRetry(message.content, true, message.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!message.isFailed && isLastUserMessage(index) && !isLoading && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 mt-1 -mr-2 opacity-50 hover:opacity-100" onClick={() => handleEditClick(message)}>
                      <Pencil className="h-3 w-3" />
                  </Button>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
             <Avatar className="h-8 w-8">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Logo className="h-5 w-5" />
                </div>
              </Avatar>
            <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
              <Spinner className="h-4 w-4"/>
              <span className="text-sm text-muted-foreground">EchoFlow is typing...</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
