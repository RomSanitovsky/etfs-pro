"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Cache the snapshot to avoid infinite loops
  const cachedValue = useRef<T>(initialValue);
  const cachedStringValue = useRef<string | null>(null);

  const getSnapshot = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      // Return cached value if nothing changed
      if (item === cachedStringValue.current) {
        return cachedValue.current;
      }
      
      // Update cache
      cachedStringValue.current = item;
      cachedValue.current = item ? (JSON.parse(item) as T) : initialValue;
      return cachedValue.current;
    } catch {
      return cachedValue.current;
    }
  }, [key, initialValue]);

  const getServerSnapshot = useCallback(() => {
    return initialValue;
  }, [initialValue]);

  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) {
          callback();
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [key]
  );

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentValue = getSnapshot();
        const valueToStore =
          value instanceof Function ? value(currentValue) : value;
        const stringValue = JSON.stringify(valueToStore);
        
        // Update cache immediately
        cachedStringValue.current = stringValue;
        cachedValue.current = valueToStore;
        
        window.localStorage.setItem(key, stringValue);
        // Dispatch storage event to trigger re-render
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: stringValue })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, getSnapshot]
  );

  return [storedValue, setValue];
}
