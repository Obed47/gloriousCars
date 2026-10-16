"use client";

import { createContext, useContext, type ReactNode } from "react";
import { en } from "./dictionaries/en";
import type { Dictionary } from "./dictionaries";

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

/**
 * Falls back to the English dictionary (with a dev-only warning) when no
 * `DictionaryProvider` is present, so every existing component keeps
 * rendering its English copy unchanged until a test or route wraps it.
 */
export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useDictionary() called outside a DictionaryProvider; falling back to the English dictionary.",
      );
    }
    return en;
  }
  return dictionary;
}
