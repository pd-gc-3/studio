import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import type { User } from '../types';

async function handleUserCreation(firebaseUser: import('firebase/auth').User): Promise<User> {
  const token = await firebaseUser.getIdToken();
  // In a real app, you would call your backend to create/verify the user in your own database.
  // const response = await fetch('/api/users', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   },
  //   body: JSON.stringify({
  //     id: firebaseUser.uid,
  //     email: firebaseUser.email,
  //     full_name: firebaseUser.displayName,
  //     avatar_url: firebaseUser.photoURL
  //   })
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to sync user with backend');
  // }
  // const backendUser = await response.json();
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    fullName: firebaseUser.displayName,
    avatarUrl: firebaseUser.photoURL,
  };
}

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return await handleUserCreation(result.user);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUpWithEmail = async (fullName: string, email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    return await handleUserCreation(userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await handleUserCreation(result.user);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
