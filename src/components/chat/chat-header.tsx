'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updateThread } from '@/lib/firebase/firestore';

interface ChatHeaderProps {
  threadTitle: string;
  threadId: string;
  isPublic: boolean;
}

export function ChatHeader({ threadTitle, threadId, isPublic }: ChatHeaderProps) {
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/share/${threadId}`;

  const handleShareToggle = async () => {
    const newPublicState = !isPublicState;
    setIsPublicState(newPublicState); // Optimistic update
    try {
        await updateThread(threadId, { isPublic: newPublicState });
        toast({
          title: `Chat is now ${newPublicState ? 'public' : 'private'}`,
          description: newPublicState ? 'Anyone with the link can view it.' : 'Only you can see this chat.',
        });
    } catch(error) {
        console.error("Failed to update sharing status:", error);
        setIsPublicState(!newPublicState); // Revert on error
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not change the sharing status. Please try again."
        });
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold">{threadTitle}</h2>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-2 space-y-4">
             <div className="flex items-center space-x-2">
                <Switch id="share-switch" checked={isPublicState} onCheckedChange={handleShareToggle} />
                <Label htmlFor="share-switch">Share Publicly</Label>
            </div>
            {isPublicState && (
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                        Link
                    </Label>
                    <Input
                        id="link"
                        defaultValue={shareUrl}
                        readOnly
                        className="h-9"
                    />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
                    <span className="sr-only">Copy</span>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
