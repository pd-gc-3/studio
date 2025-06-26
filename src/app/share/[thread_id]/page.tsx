import { ShareChatView } from '@/components/chat/share-chat-view';
import type { PublicThread } from '@/lib/types';
import { BotIcon, Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

async function getPublicThread(threadId: string): Promise<PublicThread | null> {
  // In a real app, you would fetch this from your public API endpoint:
  // const res = await fetch(`${process.env.API_URL}/api/v1/public/${threadId}`);
  // if (!res.ok) return null;
  // return res.json();
  
  // Mock data for demonstration
  if (threadId === '2') {
    return {
      id: '2',
      threadTitle: 'Tailwind CSS best practices',
      createdAt: new Date().toISOString(),
      user: {
        fullName: 'Demo User',
        avatarUrl: `https://www.gravatar.com/avatar/demo?d=identicon`,
      },
      messages: [
        { id: 'm1', role: 'user', content: 'What are some best practices for Tailwind CSS?', createdAt: new Date().toISOString() },
        { id: 'm2', role: 'assistant', content: 'Great question! Some best practices include: \n1. Using `@apply` sparingly. \n2. Leveraging `tailwind.config.js` for customization. \n3. Grouping classes with custom components.', createdAt: new Date().toISOString() },
      ],
    };
  }
  return null;
}

export default async function SharePage({ params }: { params: { thread_id: string } }) {
  const thread = await getPublicThread(params.thread_id);

  if (!thread) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-center">
        <Logo className="h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl font-bold">Chat Not Found</h1>
        <p className="text-muted-foreground">This chat is either private or does not exist.</p>
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
