'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/chat/app-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { Thread } from '@/lib/types';
import { Spinner } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getThreadsForUser, createThread, deleteThreadAndMessages } from '@/lib/firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

export default function ChatUI() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
      unsubscribe = getThreadsForUser(user.uid, (fetchedThreads) => {
        setThreads(fetchedThreads);
        
        // If there's no active thread, set the first one if it exists.
        if (!activeThread && fetchedThreads.length > 0) {
          setActiveThread(fetchedThreads[0]);
        } 
        // If there is an active thread, check if it still exists in the new list.
        else if (activeThread) {
          const activeThreadStillExists = fetchedThreads.some(t => t.id === activeThread.id);
          // If not, select the first available thread or null if none exist.
          if (!activeThreadStillExists) {
            setActiveThread(fetchedThreads.length > 0 ? fetchedThreads[0] : null);
          }
        }
      });
    }
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, activeThread]); // Rerun if user changes

  const handleNewChat = async () => {
    if(!user) return;
    const newThread = await createThread(user.uid);
    setActiveThread(newThread);
  };
  
  const handleDeleteThread = (threadId: string) => {
    // Optimistically update the UI before the DB call completes
    if (activeThread?.id === threadId) {
        // Find the index of the thread to be deleted
        const index = threads.findIndex(t => t.id === threadId);
        // Determine the next thread to be activated
        const nextThread = threads[index + 1] || threads[index - 1] || null;
        setActiveThread(nextThread);
    }
    setThreads(prev => prev.filter(t => t.id !== threadId));
    deleteThreadAndMessages(threadId);
    // The listener will eventually sync the state, but this provides a faster user experience.
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground md:flex-row">
      <AppSidebar
        user={user}
        threads={threads}
        activeThreadId={activeThread?.id}
        onSelectThread={setActiveThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        {activeThread ? (
          <ChatPanel
            key={activeThread.id}
            thread={activeThread}
            user={user}
            onThreadUpdate={(data) => setActiveThread(prev => prev ? {...prev, ...data} : null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <h1 className="font-headline text-2xl font-bold">Welcome to EchoFlow</h1>
            <p className="text-muted-foreground">Start a new conversation by clicking "New Chat" in the sidebar.</p>
             <Button onClick={handleNewChat} className="mt-4">Start New Chat</Button>
          </div>
        )}
      </main>
    </div>
  );
}
