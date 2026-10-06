"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage state.
 * Returns `[value, setValue, hydrated]`. `value` is the provided default on the
 * server and first client render; `hydrated` flips to true once the stored
 * value has been read, so consumers can avoid hydration mismatches.
 */
const identity = <T,>(raw: unknown): T => raw as T;

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  parse: (raw: unknown) => T = identity<T>,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Read the persisted value once the component is mounted on the client.
  // Reading storage is only possible post-render, so a state update here is
  // the intended pattern (see React docs: "You Might Not Need an Effect" —
  // caching an expensive/browser-only value).
  useEffect(() => {
    let stored = defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) stored = parse(JSON.parse(raw));
    } catch {
      /* private mode / disabled storage — keep the default */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(stored);
    setHydrated(true);
    // `defaultValue` is intentionally read-once; callers pass fresh literals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore write failures */
        }
        return resolved;
      });
    },
    [key],
  );

  // Keep multiple tabs / components in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        setValue(parse(JSON.parse(e.newValue)));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, parse]);

  return [value, set, hydrated];
}
