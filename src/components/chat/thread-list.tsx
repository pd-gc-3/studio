'use client';

import type { Thread } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import './ThreadList.css';

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
      <div className="empty-message">
        No threads yet.
      </div>
    );
  }

  if (isDialogMode) {
    return (
      <div className="dialog-mode-container">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={cn(
              "dialog-thread-item",
              activeThreadId === thread.id && "active-dialog-thread"
            )}
          >
            <div className="dialog-thread-content">
              <h3 className="thread-title">{thread.threadTitle}</h3>
              <p className={cn(
                "thread-subtitle",
                activeThreadId === thread.id ? "active-subtitle" : ""
              )}>
                Last message {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="delete-button-container">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="delete-button" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="icon" />
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
    <div className="normal-mode-container">
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
            "thread-item",
            activeThreadId === thread.id && "active-thread"
          )}
        >
          <div className="thread-text">
            <p className="thread-title">{thread.threadTitle}</p>
          </div>
          <div className="delete-button-container">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "delete-button",
                    activeThreadId === thread.id ? "active-delete-hover" : "inactive-delete-hover"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="icon" />
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
