"use client";

import { Trash2 } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Vehicle } from "@/lib/types";

export function FavoritesView({ vehicles }: { vehicles: Vehicle[] }) {
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
        title="No saved vehicles yet"
        description="Tap the heart on any vehicle to keep it here. Favorites are stored on this device."
        action={
          <Button href="/cars" withArrow>
            Browse all cars
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {saved.length} saved {saved.length === 1 ? "vehicle" : "vehicles"}
        </p>
        <button
          type="button"
          onClick={clearFavorites}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <Trash2 className="size-4" aria-hidden />
          Clear all
        </button>
      </div>
      <VehicleGrid vehicles={saved} />
    </div>
  );
}
