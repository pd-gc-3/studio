'use client';

import { useEffect, useState } from 'react';
import { ShareChatView } from '@/components/chat/share-chat-view';
import type { PublicThread } from '@/lib/types';
import { Logo, Spinner } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getPublicThreadData } from '@/lib/firebase/firestore';

export default function SharePage({ params }: { params: { thread_id: string } }) {
  const [thread, setThread] = useState<PublicThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const publicThread = await getPublicThreadData(params.thread_id);
        if (publicThread) {
            setThread(publicThread);
        } else {
            setError('This chat is either private or does not exist.');
        }
      } catch (e) {
        console.error("Error fetching shared thread:", e);
        setError('An error occurred while fetching the chat.');
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [params.thread_id]);

  if (loading) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <Spinner className="h-10 w-10 text-primary" />
        </div>
      )
  }

  if (error || !thread) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-center">
        <Logo className="h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl font-bold">{error ? 'An Error Occurred' : 'Chat Not Found'}</h1>
        <p className="text-muted-foreground">{error || 'This chat is either private or does not exist.'}</p>
      </div>
    );
  }

  return (
     <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-bold">EchoFlow</h1>
          </div>
          <Badge variant="outline">Public Share</Badge>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 border-b pb-4">
            <h2 className="font-headline text-2xl font-bold">{thread.threadTitle}</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={thread.user.avatarUrl ?? undefined} />
                    <AvatarFallback>{thread.user.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <span>Conversation with {thread.user.fullName}</span>
                <span>•</span>
                <span>{format(new Date(thread.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <ShareChatView messages={thread.messages} user={thread.user} />
        </div>
      </main>
    </div>
  );
}
