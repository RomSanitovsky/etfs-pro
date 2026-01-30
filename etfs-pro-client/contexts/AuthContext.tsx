"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { AuthState } from "@/lib/types";
import { FREE_TIER_SYMBOL_LIMIT, PREMIUM_SYMBOL_LIMIT } from "@/lib/constants";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  onAuthChange,
} from "@/lib/firebase/auth";
import {
  getUserDocument,
  createCheckoutSession as firestoreCreateCheckout,
  subscribeToSubscriptions,
  derivePremiumStatus,
  syncPremiumStatusToUserDoc,
} from "@/lib/firebase/firestore";
import { functions } from "@/lib/firebase/config";
import { httpsCallable } from "firebase/functions";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  createCheckoutSession: () => Promise<string>;
  createPortalSession: () => Promise<string>;
  symbolLimit: number;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Track the current uid for subscription cleanup
  const subscriptionUnsubRef = useRef<(() => void) | null>(null);

  const symbolLimit = state.user?.isPremium
    ? PREMIUM_SYMBOL_LIMIT
    : FREE_TIER_SYMBOL_LIMIT;

  const refreshUser = useCallback(async () => {
    const user = state.user;
    if (!user?.uid) return;

    try {
      const userProfile = await getUserDocument(user.uid);
      if (userProfile) {
        setState((prev) => ({ ...prev, user: userProfile }));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [state.user]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      // Clean up previous subscription listener
      if (subscriptionUnsubRef.current) {
        subscriptionUnsubRef.current();
        subscriptionUnsubRef.current = null;
      }

      if (firebaseUser) {
        try {
          const userProfile = await getUserDocument(firebaseUser.uid);
          setState({
            user: userProfile,
            loading: false,
            error: null,
          });

          // Subscribe to Stripe extension subscriptions
          if (userProfile) {
            subscriptionUnsubRef.current = subscribeToSubscriptions(
              firebaseUser.uid,
              async (subscriptions) => {
                const premiumData = derivePremiumStatus(subscriptions);
                // Update React state
                setState((prev) => {
                  if (!prev.user) return prev;
                  return {
                    ...prev,
                    user: {
                      ...prev.user,
                      isPremium: premiumData.isPremium,
                      subscriptionStatus: premiumData.subscriptionStatus,
                      cancelAtPeriodEnd: premiumData.cancelAtPeriodEnd,
                      premiumExpiresAt: premiumData.premiumExpiresAt,
                    },
                  };
                });
                // Sync to user doc for Firestore rules
                try {
                  await syncPremiumStatusToUserDoc(firebaseUser.uid, premiumData);
                } catch (err) {
                  console.error("Failed to sync premium status:", err);
                }
              }
            );
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setState({
            user: null,
            loading: false,
            error: "Failed to load user profile",
          });
        }
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      unsubscribe();
      if (subscriptionUnsubRef.current) {
        subscriptionUnsubRef.current();
        subscriptionUnsubRef.current = null;
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const userProfile = await signInWithEmail(email, password);
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const userProfile = await signUpWithEmail(email, password, displayName);
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign up";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  const signInGoogle = async () => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const userProfile = await signInWithGoogle();
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Google";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  const createCheckoutSession = async (): Promise<string> => {
    const uid = state.user?.uid;
    if (!uid) {
      throw new Error("Must be signed in to subscribe");
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) {
      throw new Error("Stripe price ID is not configured");
    }

    const url = await firestoreCreateCheckout(
      uid,
      priceId,
      `${window.location.origin}/subscription?status=success`,
      `${window.location.origin}/subscription?status=cancelled`
    );

    return url;
  };

  const createPortalSession = async (): Promise<string> => {
    if (!state.user?.uid) {
      throw new Error("Must be signed in to manage subscription");
    }

    if (!functions) {
      throw new Error("Firebase Functions is not configured");
    }

    const createPortalLink = httpsCallable<
      { returnUrl: string },
      { url: string }
    >(functions, "ext-firestore-stripe-payments-createPortalLink");

    const { data } = await createPortalLink({
      returnUrl: `${window.location.origin}/subscription`,
    });

    return data.url;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInGoogle,
        signOut,
        createCheckoutSession,
        createPortalSession,
        symbolLimit,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
