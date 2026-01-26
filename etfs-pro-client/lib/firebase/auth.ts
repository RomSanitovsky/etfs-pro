import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  updateProfile,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { auth } from "./config";
import { createUserDocument, getUserDocument, updateUserDocument } from "./firestore";
import type { UserProfile } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();
// Add additional scopes if needed
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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

// Check for redirect result on page load (call this early in auth initialization)
export async function checkGoogleRedirectResult(): Promise<UserProfile | null> {
  try {
    const authInstance = getAuth();
    const result = await getRedirectResult(authInstance, browserPopupRedirectResolver);
    if (result) {
      return processGoogleAuthResult(result);
    }
    return null;
  } catch (error) {
    // Redirect result errors are usually safe to ignore (no redirect happened)
    console.debug("No redirect result:", error);
    return null;
  }
}

// Main Google sign-in function with popup fallback to redirect
export async function signInWithGoogle(): Promise<UserProfile> {
  const authInstance = getAuth();

  try {
    // Try popup first (works well on desktop)
    const result = await signInWithPopup(authInstance, googleProvider, browserPopupRedirectResolver);
    return processGoogleAuthResult(result);
  } catch (popupError) {
    const error = popupError as { code?: string; message?: string };

    // If popup was closed by user, don't fallback - just rethrow
    if (error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request') {
      throw popupError;
    }

    // For popup-blocked or other errors, try redirect method
    // Common error codes that should trigger redirect fallback:
    // - auth/popup-blocked
    // - auth/operation-not-supported-in-this-environment
    // - auth/unauthorized-domain (sometimes)
    console.log("Popup failed, falling back to redirect:", error.code || error.message);

    // Use redirect as fallback - this will navigate away from the page
    await signInWithRedirect(authInstance, googleProvider, browserPopupRedirectResolver);

    // This line won't execute as the page will redirect
    // After redirect back, checkGoogleRedirectResult() will pick up the result
    throw new Error("Redirecting to Google sign-in...");
  }
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
