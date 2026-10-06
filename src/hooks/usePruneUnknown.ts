"use client";

import { useEffect } from "react";

/**
 * Drops saved vehicle ids that are no longer in the catalogue (sold, deleted),
 * so they stop counting toward badges and limits. Skipped when the catalogue
 * is empty, so a failed or unconfigured catalogue cannot wipe saved picks.
 */
export function usePruneUnknown(
  hydrated: boolean,
  knownIds: string[] | undefined,
  setIds: (update: (prev: string[]) => string[]) => void,
) {
  // A string key keeps the effect from re-running on every render of the parent.
  const knownKey = knownIds?.join("\n") ?? null;

  useEffect(() => {
    if (!hydrated || knownKey === null) return;
    const known = new Set(knownKey.split("\n").filter(Boolean));
    if (known.size === 0) return;
    setIds((prev) => {
      const next = prev.filter((id) => known.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [hydrated, knownKey, setIds]);
}
