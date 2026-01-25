"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
import { getUserDocument, upgradeToPremiumTest, downgradeFromPremiumTest } from "@/lib/firebase/firestore";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  downgradeFromPremium: () => Promise<void>;
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

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserDocument(firebaseUser.uid);
          setState({
            user: userProfile,
            loading: false,
            error: null,
          });
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

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userProfile = await signInWithEmail(email, password);
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userProfile = await signUpWithEmail(email, password, displayName);
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign up";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  };

  const signInGoogle = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userProfile = await signInWithGoogle();
      setState({ user: userProfile, loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Google";
      setState((prev) => ({ ...prev, loading: false, error: message }));
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

  const upgradeToPremium = async () => {
    if (!state.user) {
      throw new Error("Must be signed in to upgrade");
    }

    try {
      await upgradeToPremiumTest(state.user.uid);
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, isPremium: true } : null,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upgrade";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  const downgradeFromPremium = async () => {
    if (!state.user) {
      throw new Error("Must be signed in to downgrade");
    }

    try {
      await downgradeFromPremiumTest(state.user.uid);
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, isPremium: false, premiumExpiresAt: null } : null,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to downgrade";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInGoogle,
        signOut,
        upgradeToPremium,
        downgradeFromPremium,
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
