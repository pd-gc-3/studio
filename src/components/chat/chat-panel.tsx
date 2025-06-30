'use client';

import React, { useState, useEffect } from 'react';
import type { Thread, User, Message } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { generateThreadTitle } from '@/ai/flows/generate-thread-title';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import { useToast } from '@/hooks/use-toast';
import { 
  getMessagesForThread, 
  addMessageToThread, 
  updateThread, 
  updateMessageContent, 
  deleteMessagesFrom,
  getMostRecentMessagesForThread
} from '@/lib/firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

interface ChatPanelProps {
  thread: Thread;
  user: User;
  onThreadUpdate: (data: Partial<Thread>) => void;
}

export function ChatPanel({ thread, user, onThreadUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe: Unsubscribe = getMessagesForThread(thread.id, (fetchedMessages) => {
        setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [thread.id]);

  const handleSendMessage = async (content: string, isRetry = false, messageIdToReplace?: string) => {
    setIsLoading(true);
    let userMessageId: string | undefined = messageIdToReplace;

    // Handle editing an existing message or sending a new one
    if (isRetry && messageIdToReplace) {
        await deleteMessagesFrom(thread.id, messageIdToReplace);
        await updateMessageContent(thread.id, messageIdToReplace, content);
    } else {
        const userMessage: Omit<Message, 'id' | 'threadId' | 'createdAt'> = {
            userId: user.uid,
            role: 'user',
            content,
        };
        userMessageId = await addMessageToThread(thread.id, userMessage);
    }

    // If it's the first message ever for this thread, generate a title
    if (messages.length === 0 && !isRetry) {
      try {
        const { threadTitle } = await generateThreadTitle({ firstMessage: content });
        await updateThread(thread.id, { threadTitle });
        onThreadUpdate({ threadTitle });
      } catch (error) {
        console.warn("Could not generate thread title:", error);
      }
    }
    
    try {
      // Fetch the last 10 messages to provide context to the AI.
      const recentMessages = await getMostRecentMessagesForThread(thread.id, 10);

      const chatHistory = recentMessages.map(m => ({ role: m.role, content: m.content }));
      const { response } = await generateChatResponse({ history: chatHistory });

      const botMessage: Omit<Message, 'id' | 'threadId' | 'createdAt'> = {
        userId: 'ai-assistant',
        role: 'assistant',
        content: response,
      };
      await addMessageToThread(thread.id, botMessage);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
          variant: "destructive",
          title: "Message failed to send",
          description: "Could not get a response from the AI. Please try again.",
      });
      // Mark the user's message as failed in the UI
      if (userMessageId) {
        setMessages(msgs => msgs.map(m => m.id === userMessageId ? { ...m, isFailed: true } : m));
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex h-full max-w-full flex-1 flex-col">
      <ChatHeader
        threadTitle={thread.threadTitle}
        threadId={thread.id}
        isPublic={thread.isPublic}
      />
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} user={user} isLoading={isLoading} onRetry={handleSendMessage} />
      </div>
      <div className="border-t bg-background">
        <div className="mx-auto max-w-2xl p-4 ">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
