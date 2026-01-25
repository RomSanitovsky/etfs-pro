import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./config";
import type { UserProfile } from "@/lib/types";
import { FREE_TIER_SYMBOL_LIMIT, PREMIUM_SYMBOL_LIMIT } from "@/lib/constants";

const USERS_COLLECTION = "users";

function getDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Please set up environment variables.");
  }
  return db;
}

function convertTimestamp(timestamp: Timestamp | null): Date | null {
  return timestamp ? timestamp.toDate() : null;
}

export async function createUserDocument(user: User): Promise<UserProfile> {
  const userRef = doc(getDb(), USERS_COLLECTION, user.uid);

  const userData = {
    email: user.email || "",
    displayName: user.displayName,
    photoURL: user.photoURL,
    isPremium: false,
    premiumExpiresAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName,
    photoURL: user.photoURL,
    isPremium: false,
    premiumExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();

  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    isPremium: data.isPremium || false,
    premiumExpiresAt: convertTimestamp(data.premiumExpiresAt),
    createdAt: convertTimestamp(data.createdAt) || new Date(),
    updatedAt: convertTimestamp(data.updatedAt) || new Date(),
  };
}

export async function updateUserDocument(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>
): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Test function to upgrade user to premium (for development/testing)
export async function upgradeToPremiumTest(uid: string): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);

  // Set premium to expire in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await updateDoc(userRef, {
    isPremium: true,
    premiumExpiresAt: Timestamp.fromDate(expiresAt),
    updatedAt: serverTimestamp(),
  });
}

// Test function to downgrade user from premium (for development/testing)
export async function downgradeFromPremiumTest(uid: string): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);

  await updateDoc(userRef, {
    isPremium: false,
    premiumExpiresAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function getSymbolLimit(isPremium: boolean): number {
  return isPremium ? PREMIUM_SYMBOL_LIMIT : FREE_TIER_SYMBOL_LIMIT;
}
