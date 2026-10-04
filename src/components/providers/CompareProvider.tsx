"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const MAX_COMPARE = 3;

interface CompareContextValue {
  compareIds: string[];
  isComparing: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  canAddMore: boolean;
  count: number;
  hydrated: boolean;
  max: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "glorious-cars:compare";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds, hydrated] = useLocalStorage<string[]>(
    STORAGE_KEY,
    [],
  );

  const isComparing = useCallback(
    (id: string) => compareIds.includes(id),
    [compareIds],
  );

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= MAX_COMPARE) return prev;
        return [...prev, id];
      });
    },
    [setCompareIds],
  );

  const removeCompare = useCallback(
    (id: string) => setCompareIds((prev) => prev.filter((x) => x !== id)),
    [setCompareIds],
  );

  const clearCompare = useCallback(() => setCompareIds([]), [setCompareIds]);

  const value = useMemo<CompareContextValue>(
    () => ({
      compareIds,
      isComparing,
      toggleCompare,
      removeCompare,
      clearCompare,
      canAddMore: compareIds.length < MAX_COMPARE,
      count: compareIds.length,
      hydrated,
      max: MAX_COMPARE,
    }),
    [
      compareIds,
      isComparing,
      toggleCompare,
      removeCompare,
      clearCompare,
      hydrated,
    ],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}
