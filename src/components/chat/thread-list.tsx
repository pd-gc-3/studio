
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
              "group flex cursor-pointer items-center rounded-lg border p-4 transition-colors",
              activeThreadId === thread.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            <div className="flex-1 overflow-hidden min-w-0">
              <h3 className="font-semibold truncate whitespace-nowrap">{thread.threadTitle}</h3>
              <p className={cn(
                "text-sm truncate whitespace-nowrap",
                activeThreadId === thread.id
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}>
                Last message {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="ml-2 flex-shrink-0">
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
        role="button"
        tabIndex={0}
        onClick={() => onSelectThread(thread)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectThread(thread);
          }
        }}
        className={cn(
          "group flex h-10 w-full min-w-0 cursor-pointer items-center rounded-md px-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          activeThreadId === thread.id
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent"
        )}
      >
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <div className="ml-2 flex-1 min-w-0 overflow-hidden">
          <p className="truncate whitespace-nowrap">{thread.threadTitle}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8", 
                  activeThreadId === thread.id 
                    ? "hover:bg-primary/80" 
                    : "hover:bg-accent-foreground/10"
                )} 
                onClick={(e) => e.stopPropagation()}
              >
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
