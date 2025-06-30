import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '../types';

async function handleUserCreation(firebaseUser: import('firebase/auth').User): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let userRecord: User;

  if (!userSnap.exists()) {
    // New user, create a document in 'users' collection
    userRecord = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName,
      avatarUrl: firebaseUser.photoURL || `https://www.gravatar.com/avatar/${firebaseUser.uid}?d=identicon`,
    };
    await setDoc(userRef, {
      ...userRecord,
      createdAt: serverTimestamp(),
    });
  } else {
    // Existing user, merge data to ensure it's up to date
    const existingData = userSnap.data();
    userRecord = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName || existingData.fullName,
        avatarUrl: firebaseUser.photoURL || existingData.avatarUrl || `https://www.gravatar.com/avatar/${firebaseUser.uid}?d=identicon`,
    };
    // Update the user document with potentially new info from provider
    await setDoc(userRef, userRecord, { merge: true });
  }
  
  return userRecord;
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
    // Reload user to get the updated profile
    await userCredential.user.reload();
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
