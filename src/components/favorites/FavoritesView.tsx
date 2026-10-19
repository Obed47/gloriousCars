"use client";

import { Trash2 } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useDictionary } from "@/i18n/dictionary-context";
import type { Vehicle } from "@/lib/types";

export function FavoritesView({ vehicles }: { vehicles: Vehicle[] }) {
  const dict = useDictionary();
  const t = dict.favorites.view;
  const { favorites, clearFavorites, hydrated } = useFavorites();

  if (!hydrated) {
    return <VehicleGridSkeleton count={3} />;
  }

  const order = new Map(favorites.map((id, i) => [id, i]));
  const saved = vehicles
    .filter((v) => order.has(v.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  if (saved.length === 0) {
    return (
      <EmptyState
        title={t.emptyState.title}
        description={t.emptyState.description}
        action={
          <Button href="/cars" withArrow>
            {t.browseAllCars}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {(saved.length === 1 ? t.savedCountSingular : t.savedCountPlural).replace(
            "{count}",
            String(saved.length),
          )}
        </p>
        <button
          type="button"
          onClick={clearFavorites}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <Trash2 className="size-4" aria-hidden />
          {t.clearAll}
        </button>
      </div>
      <VehicleGrid vehicles={saved} />
    </div>
  );
}
