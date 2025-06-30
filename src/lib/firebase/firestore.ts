'use client';
import { db } from './config';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  getDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import type { Thread, Message, PublicThread, User } from '../types';

// Helper to convert Firestore Timestamps to ISO strings in an object
const convertTimestamps = (data: any) => {
    const convertedData = { ...data };
    for (const key in convertedData) {
        if (convertedData[key] instanceof Timestamp) {
            convertedData[key] = convertedData[key].toDate().toISOString();
        }
    }
    return convertedData;
};

// --- Threads ---

export const getThreadsForUser = (
  userId: string,
  callback: (threads: Thread[]) => void
) => {
  const threadsCollection = collection(db, 'threads');
  const q = query(
    threadsCollection,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const threads = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    } as Thread));
    callback(threads);
  }, (error) => {
    console.error("Error fetching threads:", error);
    callback([]);
  });
};

export const createThread = async (userId: string): Promise<Thread> => {
    const threadData = {
        userId,
        threadTitle: 'New Chat',
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const newThreadRef = await addDoc(collection(db, 'threads'), threadData);
    const newDocSnap = await getDoc(newThreadRef);
    return {
        id: newDocSnap.id,
        ...convertTimestamps(newDocSnap.data()),
    } as Thread;
};

export const updateThread = async (threadId: string, data: Partial<Omit<Thread, 'id' | 'userId'>>) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteThreadAndMessages = async (threadId: string) => {
    const threadRef = doc(db, 'threads', threadId);
    const messagesCollection = collection(threadRef, 'messages');
    
    // Delete all messages in the subcollection
    const messagesSnapshot = await getDocs(messagesCollection);
    const batch = writeBatch(db);
    messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete the thread itself
    await deleteDoc(threadRef);
};


// --- Messages ---

export const getMessagesForThread = (
    threadId: string,
    callback: (messages: Message[]) => void
) => {
    const messagesCollection = collection(db, 'threads', threadId, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            threadId,
            ...convertTimestamps(doc.data()),
        } as Message));
        callback(messages);
    }, (error) => {
        console.error("Error fetching messages:", error);
        callback([]);
    });
};

export const getMostRecentMessagesForThread = async (
  threadId: string,
  messageLimit: number
): Promise<Message[]> => {
  try {
    const messagesCollection = collection(db, 'threads', threadId, 'messages');
    const q = query(
      messagesCollection,
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      threadId,
      ...convertTimestamps(doc.data()),
    } as Message));
    // Messages are fetched in descending order, so reverse them for chronological order.
    return messages.reverse();
  } catch (error) {
    console.error("Error fetching most recent messages:", error);
    return [];
  }
};

export const addMessageToThread = async (
    threadId: string,
    message: Omit<Message, 'id' | 'threadId' | 'createdAt'>
): Promise<string> => {
    const messagesCollection = collection(db, 'threads', threadId, 'messages');
    const messageRef = await addDoc(messagesCollection, {
        ...message,
        createdAt: serverTimestamp(),
    });
    // Also update the parent thread's `updatedAt` timestamp
    await updateDoc(doc(db, 'threads', threadId), { updatedAt: serverTimestamp() });
    return messageRef.id;
};

export const updateMessageContent = async (
    threadId: string,
    messageId: string,
    content: string
) => {
    const messageRef = doc(db, 'threads', threadId, 'messages', messageId);
    await updateDoc(messageRef, { content });
    await updateDoc(doc(db, 'threads', threadId), { updatedAt: serverTimestamp() });
};

export const deleteMessagesFrom = async (threadId: string, startMessageId: string) => {
    const messagesCollection = collection(db, 'threads', threadId, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const messagesSnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let deleteSubsequent = false;

    for (const doc of messagesSnapshot.docs) {
        if (deleteSubsequent) {
            batch.delete(doc.ref);
        }
        if (doc.id === startMessageId) {
            deleteSubsequent = true;
        }
    }

    await batch.commit();
};


// --- Sharing ---
export const getPublicThreadData = async (threadId: string): Promise<PublicThread | null> => {
    try {
        const threadRef = doc(db, 'threads', threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists() || !threadSnap.data().isPublic) {
            return null;
        }
        
        const threadData = { id: threadSnap.id, ...convertTimestamps(threadSnap.data()) } as Thread;

        const messagesCollection = collection(threadRef, 'messages');
        const messagesQuery = query(messagesCollection, orderBy('createdAt', 'asc'));
        const messagesSnapshot = await getDocs(messagesQuery);

        const messages = messagesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                role: data.role,
                content: data.content,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            }
        }) as Omit<Message, 'threadId' | 'isFailed' | 'userId'>[];

        const userRef = doc(db, 'users', threadData.userId);
        const userSnap = await getDoc(userRef);
        let user: { fullName: string | null; avatarUrl: string | null; } = { fullName: 'A User', avatarUrl: `https://www.gravatar.com/avatar/${threadData.userId}?d=identicon` };
        
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            user = {
                fullName: userData.fullName,
                avatarUrl: userData.avatarUrl
            };
        }

        return {
            id: threadData.id,
            threadTitle: threadData.threadTitle,
            createdAt: threadData.createdAt,
            messages,
            user
        };
    } catch (error) {
        console.error("Error fetching public thread:", error);
        return null;
    }
}
