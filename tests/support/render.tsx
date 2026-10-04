import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";

/** Mounts the same client providers the root layout does. */
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FavoritesProvider>
      <CompareProvider>{children}</CompareProvider>
    </FavoritesProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AppProviders, ...options });
}
