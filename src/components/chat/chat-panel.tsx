'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Thread, User, Message } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { generateThreadTitle } from '@/ai/flows/generate-thread-title';
import { useToast } from '@/hooks/use-toast';

interface ChatPanelProps {
  thread: Thread;
  user: User;
}

export function ChatPanel({ thread, user }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState(thread);
  const { toast } = useToast();

  useEffect(() => {
    // Mock fetching messages for the thread
    const mockMessages: Message[] = [
      { id: 'm1', threadId: thread.id, role: 'user', content: `What's the best way to learn ${thread.threadTitle}?`, createdAt: new Date().toISOString() },
      { id: 'm2', threadId: thread.id, role: 'assistant', content: `That's a great question! For ${thread.threadTitle}, I'd recommend starting with the official documentation and building a small project. There are also many great tutorials online.`, createdAt: new Date().toISOString() },
    ];
    if(thread.id.startsWith('new-')) {
        setMessages([]);
    } else {
        setMessages(mockMessages);
    }
    setCurrentThread(thread);
  }, [thread.id, thread.threadTitle, thread]);

  const handleSendMessage = async (content: string, isRetry = false, messageIdToReplace?: string) => {
    setIsLoading(true);
    
    let updatedMessages;

    const userMessage: Message = {
      id: messageIdToReplace || `msg-${Date.now()}`,
      threadId: currentThread.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    
    // Optimistically update UI
    if (isRetry && messageIdToReplace) {
        const messageIndex = messages.findIndex(msg => msg.id === messageIdToReplace);
        if (messageIndex !== -1) {
            // This is an edit. Slice messages up to the edited one and add the new version.
            updatedMessages = [
                ...messages.slice(0, messageIndex),
                { ...userMessage, isFailed: false }
            ];
            setMessages(updatedMessages);
        } else {
            // Should not happen, but as a safeguard.
            setIsLoading(false);
            return;
        }
    } else {
        updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
    }

    // If it's the first message, generate a title
    if (messages.length === 0 && !isRetry) {
      try {
        const { threadTitle } = await generateThreadTitle({ firstMessage: content });
        setCurrentThread(t => ({...t, threadTitle}));
        // In a real app, you would PATCH this to your backend
      } catch (error) {
        console.warn("Could not generate thread title:", error);
      }
    }

    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.2; // 80% success rate for demo

    if(success) {
        const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            threadId: currentThread.id,
            role: 'assistant',
            content: `This is a simulated response about "${content.substring(0, 20)}...". In a real application, this would be a response from an AI model.`,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMessage]);
    } else {
        toast({
            variant: "destructive",
            title: "Message failed to send",
            description: "Please check your connection and try again.",
        })
        setMessages(msgs => msgs.map(m => m.id === userMessage.id ? { ...m, isFailed: true } : m));
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex h-full max-w-full flex-1 flex-col">
      <ChatHeader
        threadTitle={currentThread.threadTitle}
        threadId={currentThread.id}
        isPublic={currentThread.isPublic}
      />
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} user={user} isLoading={isLoading} onRetry={handleSendMessage} />
      </div>
      <div className="border-t bg-background">
        <div className="mx-auto max-w-2xl p-4 md:p-6">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
