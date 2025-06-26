'use client';

import React from 'react';
import { Plus, LogOut, PanelLeft, MessageSquare, Sun, Moon } from 'lucide-react';
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
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from 'date-fns';


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
  const { setTheme } = useTheme();
  const [search, setSearch] = React.useState('');
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredThreads = threads.filter((thread) =>
    thread.threadTitle.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleNewChat = () => {
    onNewChat();
  }

  const handleSelectThreadFromDialog = (thread: Thread) => {
    onSelectThread(thread);
    setIsHistoryOpen(false);
  }

  const SidebarDesktopContent = (
    <div className="flex h-full flex-col">
      {isOpen ? (
        <>
          <div className="flex h-16 shrink-0 items-center border-b px-4">
            <div className="mr-auto flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-xl font-bold">EchoFlow</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <PanelLeft />
            </Button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-2">
            <div className="p-2">
              <Button className="w-full" onClick={onNewChat}>
                <Plus className="-ml-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
            <div className="p-2">
              <Input
                ref={searchInputRef}
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
            <Separator className="my-2" />
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
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center space-y-4 p-2 pt-4">
          <TooltipProvider delayDuration={0}>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                        <PanelLeft className="h-5 w-5"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Open menu</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon" className="rounded-full h-10 w-10 bg-primary" onClick={handleNewChat}>
                  <Plus className="h-5 w-5"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>New Chat</p></TooltipContent>
            </Tooltip>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-5 w-5"/>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Chats</p></TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-2xl bg-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <span className="text-xl font-bold font-headline">Your chat history</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                   <div className="p-2">
                    <Input
                        placeholder="Search your chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-4"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground px-2">
                    You have {threads.length} previous chat{threads.length !== 1 ? 's' : ''}.
                  </p>
                  <ScrollArea className="h-[50vh]">
                    <div className="space-y-3 p-1">
                      {filteredThreads.map((thread) => (
                        <div
                          key={thread.id}
                          onClick={() => handleSelectThreadFromDialog(thread)}
                          className="group relative cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted"
                        >
                          <h3 className="font-semibold truncate pr-8">{thread.threadTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last message {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </TooltipProvider>

          <div className="flex-1"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName ?? 'User'} />
                <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end">
              <DropdownMenuLabel>{user.fullName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Sun className="mr-2 h-4 w-4" /><span>Theme</span></DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );

  const SidebarMobileContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-bold">EchoFlow</h1>
        </div>
        <SheetTrigger asChild>
           <Button variant="ghost" size="icon">
              <PanelLeft className="h-5 w-5" />
          </Button>
        </SheetTrigger>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-2">
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
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                    <LogOut />
                    <span className="sr-only">Log out</span>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );


  return (
    <>
      <div className="absolute left-2 top-2 z-10 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 bg-muted">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            {SidebarMobileContent}
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={`hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out border-r bg-card flex-shrink-0 ${
          isOpen ? 'w-72' : 'w-20'
        }`}
      >
        {SidebarDesktopContent}
      </aside>
    </>
  );
}
