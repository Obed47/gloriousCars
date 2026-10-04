"use client";

import { useState } from "react";
import { GitCompareArrows, Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useCompare } from "@/components/providers/CompareProvider";
import type { Vehicle } from "@/lib/types";

export function DetailSaveRow({ vehicle }: { vehicle: Vehicle }) {
  const { isFavorite, toggleFavorite, hydrated: favH } = useFavorites();
  const { isComparing, toggleCompare, canAddMore, hydrated: cmpH } = useCompare();
  const [pop, setPop] = useState(false);

  const fav = favH && isFavorite(vehicle.id);
  const comparing = cmpH && isComparing(vehicle.id);
  const compareDisabled = !comparing && !canAddMore;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          toggleFavorite(vehicle.id);
          setPop(true);
        }}
        onAnimationEnd={() => setPop(false)}
        aria-pressed={fav}
        className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${
          fav
            ? "border-accent/30 bg-accent-soft text-accent"
            : "border-line-strong bg-surface text-ink hover:border-ink"
        } ${pop ? "[animation:heart-pop_0.4s_ease]" : ""}`}
      >
        <Heart
          className={`size-4 ${fav ? "fill-accent text-accent" : ""}`}
          aria-hidden
        />
        {fav ? "Saved" : "Save"}
      </button>

      <button
        type="button"
        onClick={() => toggleCompare(vehicle.id)}
        disabled={compareDisabled}
        aria-pressed={comparing}
        title={compareDisabled ? "Comparison is full (max 3)" : undefined}
        className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          comparing
            ? "border-accent/30 bg-accent-soft text-accent"
            : "border-line-strong bg-surface text-ink hover:border-ink"
        }`}
      >
        <GitCompareArrows className="size-4" aria-hidden />
        {comparing ? "Comparing" : "Compare"}
      </button>
    </div>
  );
}
