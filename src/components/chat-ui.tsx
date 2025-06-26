'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/chat/app-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { Thread } from '@/lib/types';
import { Spinner } from '@/components/icons';

export default function ChatUI() {
  const { user, loading, token } = useAuth();
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
    // Mock fetching threads
    if(user) {
        const mockThreads: Thread[] = [
            { id: '1', userId: user.uid, threadTitle: 'Getting started with Next.js', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPublic: false, messages: [] },
            { id: '2', userId: user.uid, threadTitle: 'Tailwind CSS best practices', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPublic: true, messages: [] },
            { id: '3', userId: user.uid, threadTitle: 'Exploring AI concepts', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPublic: false, messages: [] },
        ];
        setThreads(mockThreads);
        if(mockThreads.length > 0) {
            setActiveThread(mockThreads[0]);
        }
    }
  }, [user]);

  const handleNewChat = () => {
    if(!user) return;
    const newThread: Thread = {
      id: `new-${Date.now()}`,
      userId: user.uid,
      threadTitle: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      messages: [],
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThread(newThread);
  };
  
  const handleDeleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThread?.id === threadId) {
      setActiveThread(threads.length > 1 ? threads[1] : null);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
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
      <main className="flex-1 flex flex-col transition-all duration-300">
        {activeThread ? (
          <ChatPanel
            key={activeThread.id}
            thread={activeThread}
            user={user}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-headline text-2xl font-bold">Welcome to EchoFlow</h1>
            <p className="text-muted-foreground">Start a new conversation by clicking "New Chat" in the sidebar.</p>
             <Button onClick={handleNewChat} className="mt-4">Start New Chat</Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Dummy Button component to resolve compilation error
const Button = ({ onClick, className, children }: { onClick: () => void; className?: string; children: React.ReactNode }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-md ${className}`}>
        {children}
    </button>
);
