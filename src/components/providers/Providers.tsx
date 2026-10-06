"use client";

import type { ReactNode } from "react";
import { FavoritesProvider } from "./FavoritesProvider";
import { CompareProvider } from "./CompareProvider";

export function Providers({
  children,
  knownIds,
}: {
  children: ReactNode;
  knownIds?: string[];
}) {
  return (
    <FavoritesProvider knownIds={knownIds}>
      <CompareProvider knownIds={knownIds}>{children}</CompareProvider>
    </FavoritesProvider>
  );
}
