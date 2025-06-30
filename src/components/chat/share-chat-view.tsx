'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons';
import ReactMarkdown from 'react-markdown';

interface ShareChatViewProps {
  messages: Omit<Message, 'threadId' | 'userId'>[];
  user: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export function ShareChatView({ messages, user }: ShareChatViewProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
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
              'max-w-2xl rounded-lg px-4 py-2 break-words',
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900/50'
                : 'bg-white dark:bg-gray-800'
            )}
          >
             <article className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </article>
          </div>

          {message.role === 'user' && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}
