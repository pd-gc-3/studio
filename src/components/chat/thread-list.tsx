'use client';

import type { Thread } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId?: string;
  onSelectThread: (thread: Thread) => void;
  onDeleteThread: (threadId: string) => void;
  isDialogMode?: boolean;
}

export function ThreadList({
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  isDialogMode = false,
}: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No threads yet.
      </div>
    );
  }

  if (isDialogMode) {
    return (
      <div className="space-y-3 p-1">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={cn(
              "group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
              activeThreadId === thread.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            <div className="flex-1 overflow-hidden">
              <h3 className="font-semibold truncate">{thread.threadTitle}</h3>
              <p className={cn(
                "text-sm",
                activeThreadId === thread.id
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}>
                Last message {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex-shrink-0 pl-2">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the thread "{thread.threadTitle}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteThread(thread.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className={cn(
            "group flex h-10 w-full items-center rounded-md pr-1 transition-colors",
            activeThreadId === thread.id
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          )}
        >
          <button
            className="flex h-full flex-1 min-w-0 items-center gap-2 p-2 text-left focus:outline-none"
            onClick={() => onSelectThread(thread)}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{thread.threadTitle}</span>
          </button>
          <div className="flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8", activeThreadId === thread.id ? "hover:bg-primary/80" : "hover:bg-accent-foreground/10")} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the thread "{thread.threadTitle}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteThread(thread.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
