"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

interface AddSymbolFormProps {
  onAdd: (symbol: string) => void;
  existingSymbols: string[];
  isLoading?: boolean;
  symbolLimit: number;
}

export function AddSymbolForm({
  onAdd,
  existingSymbols,
  isLoading = false,
  symbolLimit,
}: AddSymbolFormProps) {
  const isAtLimit = existingSymbols.length >= symbolLimit;
  const [symbol, setSymbol] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (symbol.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(symbol)}`);
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [symbol]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSymbol(symbol);
  };

  const submitSymbol = (value: string) => {
    setError("");
    const trimmed = value.trim().toUpperCase();

    if (!trimmed) {
      setError("Please enter a symbol");
      return;
    }

    if (isAtLimit) {
      setError(`Limit reached (${symbolLimit} symbols). Upgrade to add more.`);
      return;
    }

    if (existingSymbols.includes(trimmed)) {
      setError("Symbol already in watchlist");
      return;
    }

    onAdd(trimmed);
    setSymbol("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: SearchResult) => {
    submitSymbol(suggestion.symbol);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value.toUpperCase());
              setError("");
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => symbol.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={isAtLimit ? `Limit: ${existingSymbols.length}/${symbolLimit}` : "Add symbol (e.g., GOOGL)"}
            className={`space-input w-full pl-4 ${isAtLimit ? "border-amber-500/50" : ""}`}
            disabled={isLoading || isAtLimit}
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.symbol}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      index === selectedIndex ? "bg-slate-800" : ""
                    } ${existingSymbols.includes(suggestion.symbol) ? "opacity-50" : ""}`}
                    disabled={existingSymbols.includes(suggestion.symbol)}
                  >
                    <div>
                      <span className="font-mono font-bold text-white">{suggestion.symbol}</span>
                      <span className="text-slate-400 text-sm ml-2 truncate">{suggestion.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-2">{suggestion.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="space-button" disabled={isLoading || isAtLimit}>
          {isLoading ? "Adding..." : isAtLimit ? "Full" : "Add"}
        </button>
      </form>
      {/* Symbol count indicator */}
      <div className="flex items-center justify-end mt-1 gap-2">
        <span className={`text-xs ${isAtLimit ? "text-amber-400" : "text-slate-500"}`}>
          {existingSymbols.length}/{symbolLimit} symbols
        </span>
        {isAtLimit && (
          <span className="text-xs text-cyan-400">Upgrade for more</span>
        )}
      </div>
    </div>
  );
}
