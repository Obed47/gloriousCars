"use client";

import type { ReactNode } from "react";
import { FavoritesProvider } from "./FavoritesProvider";
import { CompareProvider } from "./CompareProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FavoritesProvider>
      <CompareProvider>{children}</CompareProvider>
    </FavoritesProvider>
  );
}
