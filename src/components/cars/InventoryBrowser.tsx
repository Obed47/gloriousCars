"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterPanel } from "./FilterPanel";
import { SortSelect } from "./SortSelect";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { filterVehicles, sortVehicles } from "@/lib/filtering";
import {
  hasActiveFilters,
  parseSearchParams,
  queryToSearchString,
} from "@/lib/searchParams";
import { formatMileage, formatPriceCompact } from "@/lib/format";
import type { FilterOptions, Vehicle, VehicleQuery } from "@/lib/types";

function activeChips(
  query: VehicleQuery,
): { label: string; clear: Partial<VehicleQuery> }[] {
  const chips: { label: string; clear: Partial<VehicleQuery> }[] = [];
  const pushList = (
    key:
      | "brand"
      | "bodyType"
      | "fuelType"
      | "transmission"
      | "color"
      | "condition",
  ) => {
    (query[key] ?? []).forEach((value) => {
      chips.push({
        label: value,
        clear: { [key]: (query[key] ?? []).filter((v) => v !== value) },
      });
    });
  };
  pushList("brand");
  pushList("bodyType");
  pushList("fuelType");
  pushList("transmission");
  pushList("condition");
  pushList("color");
  if (query.minPrice != null)
    chips.push({
      label: `From ${formatPriceCompact(query.minPrice, "XAF")}`,
      clear: { minPrice: undefined },
    });
  if (query.maxPrice != null)
    chips.push({
      label: `Up to ${formatPriceCompact(query.maxPrice, "XAF")}`,
      clear: { maxPrice: undefined },
    });
  if (query.minYear != null)
    chips.push({ label: `${query.minYear}+`, clear: { minYear: undefined } });
  if (query.maxYear != null)
    chips.push({ label: `≤ ${query.maxYear}`, clear: { maxYear: undefined } });
  if (query.maxMileage != null)
    chips.push({
      label: `≤ ${formatMileage(query.maxMileage)}`,
      clear: { maxMileage: undefined },
    });
  if (query.search)
    chips.push({ label: `“${query.search}”`, clear: { search: undefined } });
  return chips;
}

export function InventoryBrowser({
  vehicles,
  options,
}: {
  vehicles: Vehicle[];
  options: FilterOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useMemo<VehicleQuery>(
    () => parseSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const results = useMemo(() => {
    const filtered = filterVehicles(vehicles, query);
    return sortVehicles(filtered, query.sort ?? "featured");
  }, [vehicles, query]);

  function commit(next: VehicleQuery) {
    const qs = queryToSearchString(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const patch = (p: Partial<VehicleQuery>) => commit({ ...query, ...p });
  const reset = () => commit({ sort: query.sort });

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const chips = activeChips(query);
  const active = hasActiveFilters(query);
  const noun = vehicles.length === 1 ? "vehicle" : "vehicles";
  const countLabel =
    results.length === vehicles.length
      ? `${results.length} ${noun} available`
      : `${results.length} of ${vehicles.length} ${noun}`;

  return (
    <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-[270px_1fr] lg:gap-12">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          <FilterPanel
            options={options}
            query={query}
            onChange={patch}
            onReset={reset}
          />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p
            className="text-sm font-semibold text-ink"
            aria-live="polite"
            role="status"
          >
            {countLabel}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold text-ink lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filter
              {active && (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[0.625rem] text-white">
                  {chips.length}
                </span>
              )}
            </button>
            <SortSelect
              value={query.sort ?? "featured"}
              onChange={(sort) => patch({ sort })}
            />
          </div>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip, i) => (
              <button
                key={`${chip.label}-${i}`}
                type="button"
                onClick={() => patch(chip.clear)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface py-1 pl-3 pr-2 text-xs font-medium text-ink transition-colors hover:border-ink"
              >
                {chip.label}
                <X className="size-3 text-muted" aria-hidden />
              </button>
            ))}
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-accent hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        <div className="mt-6">
          {results.length > 0 ? (
            <VehicleGrid
              vehicles={results}
              priorityCount={3}
              columns="sidebar"
            />
          ) : (
            <EmptyState
              title="No vehicles match your search"
              description="Try widening your price range or removing a filter."
              action={
                <Button variant="primary" size="sm" onClick={reset}>
                  Reset filters
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-surface lg:hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Filter and sort"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-bold text-ink">
                Filter &amp; Sort
              </h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="flex size-9 items-center justify-center rounded-lg text-ink hover:bg-black/5"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2">
              <label className="flex items-center justify-between border-b border-line py-4 text-sm font-semibold text-ink">
                Sort by
                <SortSelect
                  value={query.sort ?? "featured"}
                  onChange={(sort) => patch({ sort })}
                />
              </label>
              <FilterPanel
                options={options}
                query={query}
                onChange={patch}
                onReset={reset}
              />
            </div>

            <div className="flex gap-3 border-t border-line p-4">
              <Button variant="outline" fullWidth onClick={reset}>
                Reset
              </Button>
              <Button fullWidth onClick={() => setSheetOpen(false)}>
                Show {results.length} results
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
