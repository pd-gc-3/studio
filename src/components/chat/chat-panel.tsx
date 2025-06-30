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
  getMostRecentMessagesForThread,
  setMessageFailedStatus,
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

    try {
      // Step 1: Add or update the user's message in Firestore.
      if (isRetry && messageIdToReplace) {
        // On retry/edit, update the content and reset the failed status.
        await updateMessageContent(thread.id, messageIdToReplace, content);
        // Then, clear the subsequent conversation to regenerate it.
        await deleteMessagesFrom(thread.id, messageIdToReplace);
      } else {
        // For a new message, just add it to the thread.
        const userMessage: Omit<Message, 'id' | 'threadId' | 'createdAt' | 'isFailed'> = {
          userId: user.uid,
          role: 'user',
          content,
        };
        userMessageId = await addMessageToThread(thread.id, userMessage);
      }

      // Step 2: Generate a thread title if it's the first message (fire-and-forget).
      if (messages.length === 0 && !isRetry) {
        generateThreadTitle({ firstMessage: content })
          .then(({ threadTitle }) => {
            updateThread(thread.id, { threadTitle });
            onThreadUpdate({ threadTitle });
          })
          .catch(error => {
            console.warn("Could not generate thread title:", error);
          });
      }
      
      // Step 3: Get chat history and call the AI for a response.
      const recentMessages = await getMostRecentMessagesForThread(thread.id, 10);
      const chatHistory = recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const { response } = await generateChatResponse({ history: chatHistory });

      // Step 4: Add the AI's response to the thread.
      const botMessage: Omit<Message, 'id' | 'threadId' | 'createdAt' | 'isFailed'> = {
        userId: 'ai-assistant',
        role: 'assistant',
        content: response,
      };
      await addMessageToThread(thread.id, botMessage);

    } catch (error) {
      // Step 5: Handle any errors during the process.
      console.error("Failed to send message or get AI response:", error);
      toast({
        variant: "destructive",
        title: "Message failed to send",
        description: "An error occurred. Please try again.",
      });
      // If we know which user message failed, mark it in the DB.
      if (userMessageId) {
        await setMessageFailedStatus(thread.id, userMessageId, true);
      }
    } finally {
      // Step 6: Ensure the loading state is turned off.
      setIsLoading(false);
    }
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
