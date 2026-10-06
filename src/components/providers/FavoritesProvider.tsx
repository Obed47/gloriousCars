"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePruneUnknown } from "@/hooks/usePruneUnknown";
import { parseStoredIds } from "@/lib/storedIds";

interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  count: number;
  hydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "glorious-cars:favorites";

export function FavoritesProvider({
  children,
  knownIds,
}: {
  children: ReactNode;
  /** Ids of the vehicles that exist; saved ids outside this list are dropped. */
  knownIds?: string[];
}) {
  const [favorites, setFavorites, hydrated] = useLocalStorage<string[]>(
    STORAGE_KEY,
    [],
    parseStoredIds,
  );
  usePruneUnknown(hydrated, knownIds, setFavorites);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
      );
    },
    [setFavorites],
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      count: favorites.length,
      hydrated,
    }),
    [favorites, isFavorite, toggleFavorite, clearFavorites, hydrated],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
