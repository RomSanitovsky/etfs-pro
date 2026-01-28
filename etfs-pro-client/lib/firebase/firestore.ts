import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./config";
import type { UserProfile, PortfolioHolding, PortfolioTransaction, AddTransactionInput, EditTransactionInput } from "@/lib/types";
import { DEFAULT_SYMBOLS, DEFAULTS_VERSION, FREE_TIER_SYMBOL_LIMIT, PREMIUM_SYMBOL_LIMIT, STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_THEME, themes, type ThemeMode } from "@/lib/themes";

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

// Get initial watchlist from localStorage (for migration) or use defaults
function getInitialWatchlist(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_SYMBOLS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce free tier limit for new users
        return parsed.slice(0, FREE_TIER_SYMBOL_LIMIT);
      }
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_SYMBOLS;
}

// Clear localStorage watchlist after migration
function clearLocalStorageWatchlist(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
    } catch {
      // Ignore errors
    }
  }
}

export async function createUserDocument(user: User): Promise<UserProfile> {
  const userRef = doc(getDb(), USERS_COLLECTION, user.uid);

  // Migrate watchlist from localStorage or use defaults
  const initialWatchlist = getInitialWatchlist();

  const userData = {
    email: user.email || "",
    displayName: user.displayName,
    photoURL: user.photoURL,
    isPremium: false,
    premiumExpiresAt: null,
    watchlist: initialWatchlist,
    theme: DEFAULT_THEME,
    defaultsVersion: DEFAULTS_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  // Clear localStorage after successful migration
  clearLocalStorageWatchlist();

  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName,
    photoURL: user.photoURL,
    isPremium: false,
    premiumExpiresAt: null,
    watchlist: initialWatchlist,
    theme: DEFAULT_THEME,
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

  // Migrate existing users who don't have a watchlist field
  let watchlist = data.watchlist;
  let needsUpdate = false;
  const updates: Record<string, unknown> = {};

  if (!watchlist || !Array.isArray(watchlist)) {
    watchlist = getInitialWatchlist();
    updates.watchlist = watchlist;
    updates.defaultsVersion = DEFAULTS_VERSION;
    needsUpdate = true;
  } else if ((data.defaultsVersion || 0) < DEFAULTS_VERSION) {
    // Merge new default symbols that aren't already in the user's watchlist
    const newDefaults = DEFAULT_SYMBOLS.filter((s) => !watchlist.includes(s));
    if (newDefaults.length > 0) {
      watchlist = [...watchlist, ...newDefaults];
      updates.watchlist = watchlist;
    }
    updates.defaultsVersion = DEFAULTS_VERSION;
    needsUpdate = true;
  }

  if (needsUpdate) {
    updates.updatedAt = serverTimestamp();
    await updateDoc(userRef, updates);
  }

  // Validate stored theme or fall back to default
  const storedTheme = data.theme as ThemeMode | undefined;
  const theme: ThemeMode = storedTheme && themes[storedTheme] ? storedTheme : DEFAULT_THEME;

  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    isPremium: data.isPremium || false,
    premiumExpiresAt: convertTimestamp(data.premiumExpiresAt),
    watchlist,
    theme,
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

// Watchlist functions

export async function updateWatchlist(uid: string, symbols: string[]): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    watchlist: symbols,
    updatedAt: serverTimestamp(),
  });
}

export async function addSymbolToWatchlist(uid: string, symbol: string): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    watchlist: arrayUnion(symbol.toUpperCase()),
    updatedAt: serverTimestamp(),
  });
}

export async function removeSymbolFromWatchlist(uid: string, symbol: string): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    watchlist: arrayRemove(symbol.toUpperCase()),
    updatedAt: serverTimestamp(),
  });
}

// Portfolio functions

const PORTFOLIO_SUBCOLLECTION = "portfolio";

function convertHoldingFromFirestore(symbol: string, data: Record<string, unknown>): PortfolioHolding {
  return {
    symbol,
    transactions: (data.transactions as PortfolioTransaction[]) || [],
    totalShares: (data.totalShares as number) || 0,
    averageCost: (data.averageCost as number) || 0,
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
  };
}

export async function getPortfolioHoldings(uid: string): Promise<PortfolioHolding[]> {
  const portfolioRef = collection(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION);
  const snapshot = await getDocs(portfolioRef);

  return snapshot.docs.map((doc) => convertHoldingFromFirestore(doc.id, doc.data()));
}

export async function addPortfolioTransaction(
  uid: string,
  input: AddTransactionInput
): Promise<void> {
  const symbol = input.symbol.toUpperCase();
  const holdingRef = doc(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION, symbol);
  const holdingSnap = await getDoc(holdingRef);

  const newTransaction: PortfolioTransaction = {
    id: crypto.randomUUID(),
    shares: input.shares,
    pricePerShare: input.pricePerShare,
    purchaseDate: input.purchaseDate,
    ...(input.notes ? { notes: input.notes } : {}),
    createdAt: new Date().toISOString(),
  };

  if (holdingSnap.exists()) {
    // Add to existing holding
    const existingData = holdingSnap.data();
    const existingTransactions = (existingData.transactions as PortfolioTransaction[]) || [];
    const allTransactions = [...existingTransactions, newTransaction];

    // Recalculate totals
    const totalShares = allTransactions.reduce((sum, t) => sum + t.shares, 0);
    const totalCost = allTransactions.reduce((sum, t) => sum + t.shares * t.pricePerShare, 0);
    const averageCost = totalShares > 0 ? totalCost / totalShares : 0;

    await updateDoc(holdingRef, {
      transactions: allTransactions,
      totalShares,
      averageCost,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new holding
    await setDoc(holdingRef, {
      symbol,
      transactions: [newTransaction],
      totalShares: input.shares,
      averageCost: input.pricePerShare,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deletePortfolioTransaction(
  uid: string,
  symbol: string,
  transactionId: string
): Promise<void> {
  const holdingRef = doc(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION, symbol.toUpperCase());
  const holdingSnap = await getDoc(holdingRef);

  if (!holdingSnap.exists()) {
    throw new Error("Holding not found");
  }

  const existingData = holdingSnap.data();
  const existingTransactions = (existingData.transactions as PortfolioTransaction[]) || [];
  const filteredTransactions = existingTransactions.filter((t) => t.id !== transactionId);

  if (filteredTransactions.length === 0) {
    // Delete the entire holding if no transactions left
    await deleteDoc(holdingRef);
  } else {
    // Recalculate totals
    const totalShares = filteredTransactions.reduce((sum, t) => sum + t.shares, 0);
    const totalCost = filteredTransactions.reduce((sum, t) => sum + t.shares * t.pricePerShare, 0);
    const averageCost = totalShares > 0 ? totalCost / totalShares : 0;

    await updateDoc(holdingRef, {
      transactions: filteredTransactions,
      totalShares,
      averageCost,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function editPortfolioTransaction(
  uid: string,
  input: EditTransactionInput
): Promise<void> {
  const symbol = input.symbol.toUpperCase();
  const holdingRef = doc(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION, symbol);
  const holdingSnap = await getDoc(holdingRef);

  if (!holdingSnap.exists()) {
    throw new Error("Holding not found");
  }

  const existingData = holdingSnap.data();
  const existingTransactions = (existingData.transactions as PortfolioTransaction[]) || [];
  const txIndex = existingTransactions.findIndex((t) => t.id === input.transactionId);

  if (txIndex === -1) {
    throw new Error("Transaction not found");
  }

  const updatedTransaction: PortfolioTransaction = {
    id: existingTransactions[txIndex].id,
    shares: input.shares,
    pricePerShare: input.pricePerShare,
    purchaseDate: input.purchaseDate,
    createdAt: existingTransactions[txIndex].createdAt,
    ...(input.notes ? { notes: input.notes } : {}),
  };
  const updatedTransactions = [...existingTransactions];
  updatedTransactions[txIndex] = updatedTransaction;

  const totalShares = updatedTransactions.reduce((sum, t) => sum + t.shares, 0);
  const totalCost = updatedTransactions.reduce((sum, t) => sum + t.shares * t.pricePerShare, 0);
  const averageCost = totalShares > 0 ? totalCost / totalShares : 0;

  await updateDoc(holdingRef, {
    transactions: updatedTransactions,
    totalShares,
    averageCost,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePortfolioHolding(uid: string, symbol: string): Promise<void> {
  const holdingRef = doc(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION, symbol.toUpperCase());
  await deleteDoc(holdingRef);
}

export function subscribeToPortfolio(
  uid: string,
  callback: (holdings: PortfolioHolding[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const portfolioRef = collection(getDb(), USERS_COLLECTION, uid, PORTFOLIO_SUBCOLLECTION);
  const q = query(portfolioRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const holdings = snapshot.docs.map((doc) =>
        convertHoldingFromFirestore(doc.id, doc.data())
      );
      callback(holdings);
    },
    (error) => {
      console.error("Portfolio subscription error:", error);
      onError?.(error);
    }
  );
}
