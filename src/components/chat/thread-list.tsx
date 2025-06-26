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
              "group relative cursor-pointer rounded-lg border p-4 transition-colors",
              activeThreadId === thread.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            <h3 className="font-semibold truncate pr-8">{thread.threadTitle}</h3>
            <p className={cn(
              "text-sm",
              activeThreadId === thread.id
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}>
              Last message {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
            </p>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
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
        <div key={thread.id} className="group relative">
          <Button
            variant='ghost'
            className={cn(
              "h-10 w-full justify-start gap-2 truncate pl-2 pr-10",
              activeThreadId === thread.id && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => onSelectThread(thread)}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate text-left">{thread.threadTitle}</span>
          </Button>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
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
