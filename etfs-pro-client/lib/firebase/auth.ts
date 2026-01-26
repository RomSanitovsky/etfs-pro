import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { createUserDocument, getUserDocument, updateUserDocument } from "./firestore";
import type { UserProfile } from "@/lib/types";

// Create provider on demand to avoid initialization issues
function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return provider;
}

function getAuthInstance() {
  if (!auth) {
    throw new Error("Firebase is not configured. Please set up environment variables.");
  }
  return auth;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(getAuthInstance(), email, password);
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
  const result = await createUserWithEmailAndPassword(getAuthInstance(), email, password);

  if (displayName) {
    await updateProfile(result.user, { displayName });
  }

  return createUserDocument(result.user);
}

// Helper to process Google auth result
async function processGoogleAuthResult(result: UserCredential): Promise<UserProfile> {
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

// Simple Google sign-in with popup
export async function signInWithGoogle(): Promise<UserProfile> {
  console.log("[Auth] signInWithGoogle called");

  let authInstance;
  try {
    authInstance = getAuthInstance();
    console.log("[Auth] Got auth instance:", !!authInstance);
  } catch (e) {
    console.error("[Auth] Failed to get auth instance:", e);
    throw e;
  }

  const provider = getGoogleProvider();
  console.log("[Auth] Created Google provider, calling signInWithPopup...");

  try {
    const result = await signInWithPopup(authInstance, provider);
    console.log("[Auth] signInWithPopup succeeded");
    return processGoogleAuthResult(result);
  } catch (e) {
    console.error("[Auth] signInWithPopup failed:", e);
    throw e;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
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
