'use client';

import React from 'react';
import { Plus, LogOut, PanelLeft } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import type { User, Thread } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThreadList } from './thread-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


interface AppSidebarProps {
  user: User;
  threads: Thread[];
  activeThreadId?: string;
  onSelectThread: (thread: Thread) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AppSidebar({
  user,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  isOpen,
  setIsOpen,
}: AppSidebarProps) {
  const [search, setSearch] = React.useState('');

  const filteredThreads = threads.filter((thread) =>
    thread.threadTitle.toLowerCase().includes(search.toLowerCase())
  );
  
  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-muted/50 p-2">
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-bold">EchoFlow</h1>
          </div>
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
              <PanelLeft />
          </Button>
        </div>
      </div>

      <div className="p-2">
        <Button className="w-full" onClick={onNewChat}>
          <Plus className="-ml-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="p-2">
        <Input
          placeholder="Search threads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <ThreadList
          threads={filteredThreads}
          activeThreadId={activeThreadId}
          onSelectThread={onSelectThread}
          onDeleteThread={onDeleteThread}
        />
      </ScrollArea>

      <Separator />

      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName ?? 'User'} />
            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{user.fullName || user.email}</span>
        </div>
        <div className='flex items-center'>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut />
                <span className="sr-only">Log out</span>
            </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="md:hidden p-2 absolute top-2 left-2 z-10">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={`hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-0'
        } overflow-hidden`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
