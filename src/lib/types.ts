export interface User {
  uid: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface Thread {
  id: string;
  userId: string;
  threadTitle: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  isFailed?: boolean;
}

export interface PublicThread {
    id: string;
    threadTitle: string;
    createdAt: string;
    messages: Omit<Message, 'threadId' | 'isFailed'>[];
    user: {
        fullName: string | null;
        avatarUrl: string | null;
    }
}
