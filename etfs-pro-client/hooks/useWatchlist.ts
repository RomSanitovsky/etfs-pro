"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_SYMBOLS } from "@/lib/constants";
import {
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
} from "@/lib/firebase/firestore";

interface UseWatchlistReturn {
  watchlist: string[];
  addSymbol: (symbol: string) => Promise<void>;
  removeSymbol: (symbol: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useWatchlist(): UseWatchlistReturn {
  const { user, refreshUser, symbolLimit } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get watchlist from user profile or use defaults for logged-out users
  const watchlist = user?.watchlist ?? DEFAULT_SYMBOLS;

  const addSymbol = useCallback(
    async (symbol: string) => {
      if (!user) {
        setError("Must be logged in to add symbols");
        return;
      }

      // Check limit before adding
      if (watchlist.length >= symbolLimit) {
        setError(`Watchlist limit reached (${symbolLimit} symbols)`);
        return;
      }

      // Check if already exists
      if (watchlist.includes(symbol.toUpperCase())) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await addSymbolToWatchlist(user.uid, symbol);
        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add symbol");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, watchlist, symbolLimit, refreshUser]
  );

  const removeSymbol = useCallback(
    async (symbol: string) => {
      if (!user) {
        setError("Must be logged in to remove symbols");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await removeSymbolFromWatchlist(user.uid, symbol);
        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove symbol");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, refreshUser]
  );

  return {
    watchlist,
    addSymbol,
    removeSymbol,
    isLoading,
    error,
  };
}
