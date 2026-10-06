"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Fuel,
  GitCompareArrows,
  Heart,
  Gauge,
  Settings2,
  Users,
} from "lucide-react";
import { VehicleImage } from "./VehicleImage";
import { Badge } from "@/components/ui/Badge";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useCompare } from "@/components/providers/CompareProvider";
import { formatMileage, formatPrice } from "@/lib/format";
import { vehiclePath, vehicleTitle } from "@/lib/slug";
import type { Vehicle } from "@/lib/types";

export function VehicleCard({
  vehicle,
  priority = false,
  sizes,
}: {
  vehicle: Vehicle;
  priority?: boolean;
  sizes?: string;
}) {
  const { isFavorite, toggleFavorite, hydrated: favHydrated } = useFavorites();
  const {
    isComparing,
    toggleCompare,
    canAddMore,
    hydrated: cmpHydrated,
  } = useCompare();

  const [pop, setPop] = useState(false);

  const fav = favHydrated && isFavorite(vehicle.id);
  const comparing = cmpHydrated && isComparing(vehicle.id);
  const compareDisabled = !comparing && !canAddMore;
  const href = vehiclePath(vehicle);
  const title = vehicleTitle(vehicle);

  const specs = [
    { Icon: Settings2, label: vehicle.transmission },
    { Icon: Fuel, label: vehicle.fuelType },
    { Icon: Users, label: `${vehicle.seats} seats` },
    { Icon: Gauge, label: formatMileage(vehicle.mileage) },
  ];

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lift">
      {/* Media */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <VehicleImage
            src={vehicle.images[0]?.url ?? ""}
            alt={vehicle.images[0]?.alt ?? title}
            priority={priority}
            sizes={
              sizes ?? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            }
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
          aria-hidden
        />

        {vehicle.featured && (
          <div className="absolute left-3 top-3">
            <Badge tone="featured">Featured</Badge>
          </div>
        )}

        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              toggleFavorite(vehicle.id);
              setPop(true);
            }}
            onAnimationEnd={() => setPop(false)}
            aria-pressed={fav}
            aria-label={
              fav
                ? `Remove ${title} from favorites`
                : `Save ${title} to favorites`
            }
            className={`flex size-9 items-center justify-center rounded-full bg-white/92 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white ${
              pop ? "[animation:heart-pop_0.4s_ease]" : ""
            }`}
          >
            <Heart
              className={`size-[1.05rem] transition-colors ${
                fav ? "fill-accent text-accent" : "text-ink"
              }`}
              aria-hidden
            />
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(vehicle.id)}
            disabled={compareDisabled}
            aria-pressed={comparing}
            aria-label={
              comparing
                ? `Remove ${title} from comparison`
                : `Add ${title} to comparison`
            }
            title={compareDisabled ? "Comparison is full (max 3)" : "Compare"}
            className={`flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              comparing
                ? "bg-accent text-white"
                : "bg-white/92 text-ink hover:bg-white"
            }`}
          >
            <GitCompareArrows className="size-[1.05rem]" aria-hidden />
          </button>
        </div>

        {/* Hover affordance */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden
        >
          View details
          <ArrowRight className="size-4" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="eyebrow text-muted">{vehicle.brand}</span>
          <span className="font-medium text-muted">{vehicle.year}</span>
        </div>

        <h3 className="text-[1.0625rem] font-bold leading-snug text-ink">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[0.8125rem] text-muted">
          {specs.map(({ Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 text-silver" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 pt-2">
          <div className="min-w-0">
            {vehicle.status !== "Available" && (
              <span className="mb-1 block text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
                {vehicle.status}
              </span>
            )}
            <p className="text-xl font-extrabold tracking-tight text-ink">
              {formatPrice(vehicle.price, vehicle.currency)}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
            View
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
