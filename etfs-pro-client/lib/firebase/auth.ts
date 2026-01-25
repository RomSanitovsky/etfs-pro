import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { createUserDocument, getUserDocument, updateUserDocument } from "./firestore";
import type { UserProfile } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();

function getAuth() {
  if (!auth) {
    throw new Error("Firebase is not configured. Please set up environment variables.");
  }
  return auth;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(getAuth(), email, password);
  const userProfile = await getUserDocument(result.user.uid);

  if (!userProfile) {
    return createUserDocument(result.user);
  }

  return userProfile;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(getAuth(), email, password);

  if (displayName) {
    await updateProfile(result.user, { displayName });
  }

  return createUserDocument(result.user);
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(getAuth(), googleProvider);

  let userProfile = await getUserDocument(result.user.uid);

  if (!userProfile) {
    userProfile = await createUserDocument(result.user);
  } else {
    await updateUserDocument(result.user.uid, {
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    });
    userProfile = {
      ...userProfile,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    };
  }

  return userProfile;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth());
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    // Return a no-op unsubscribe function if Firebase is not configured
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}
