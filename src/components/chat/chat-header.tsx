'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, Share2, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChatHeaderProps {
  threadTitle: string;
  threadId: string;
  isPublic: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({ threadTitle, threadId, isPublic, onToggleSidebar }: ChatHeaderProps) {
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/share/${threadId}`;

  const handleShare = async () => {
    // In a real app, this would be a PATCH request to your API
    setIsPublicState(prev => !prev);
    toast({
      title: `Chat is now ${!isPublicState ? 'public' : 'private'}`,
      description: !isPublicState ? 'Anyone with the link can view it.' : 'Only you can see this chat.',
    });
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <h2 className="truncate text-lg font-semibold">{threadTitle}</h2>
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
                <Switch id="share-switch" checked={isPublicState} onCheckedChange={handleShare} />
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

// Dummy components to resolve compilation error
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
