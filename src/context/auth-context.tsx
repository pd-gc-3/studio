'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  token: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userRecord: User = {
          uid: fbUser.uid,
          email: fbUser.email,
          fullName: fbUser.displayName,
          avatarUrl: fbUser.photoURL || `https://www.gravatar.com/avatar/${fbUser.uid}?d=identicon`,
        };
        setUser(userRecord);
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
      } else {
        setUser(null);
        setFirebaseUser(null);
        setToken(null);
        if (pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/share')) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};
