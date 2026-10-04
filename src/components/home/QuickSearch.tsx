"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { CarGlyph } from "@/components/ui/icons";
import { formatPriceCompact } from "@/lib/format";
import { queryToSearchString } from "@/lib/searchParams";
import type { FilterOptions } from "@/lib/types";

interface Selection {
  brand: string;
  body: string;
  fuel: string;
  transmission: string;
  yearMin: string;
  priceMax: string;
}

const EMPTY: Selection = {
  brand: "",
  body: "",
  fuel: "",
  transmission: "",
  yearMin: "",
  priceMax: "",
};

function Field({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-muted">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-9 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </label>
  );
}

export function QuickSearch({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const [sel, setSel] = useState<Selection>(EMPTY);

  const set = (key: keyof Selection) => (v: string) =>
    setSel((prev) => ({ ...prev, [key]: v }));

  const filledCount = Object.values(sel).filter(Boolean).length;
  const progress = useMemo(() => Math.min(filledCount / 4, 1), [filledCount]);

  const priceTiers = useMemo(() => {
    const [, max] = options.priceRange;
    const step = 15000;
    const tiers: number[] = [];
    for (let p = step; p < max; p += step) tiers.push(p);
    tiers.push(Math.ceil(max / 1000) * 1000);
    return tiers;
  }, [options.priceRange]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qs = queryToSearchString({
      brand: sel.brand ? [sel.brand] : undefined,
      bodyType: sel.body ? [sel.body] : undefined,
      fuelType: sel.fuel ? [sel.fuel] : undefined,
      transmission: sel.transmission ? [sel.transmission] : undefined,
      minYear: sel.yearMin ? Number(sel.yearMin) : undefined,
      maxPrice: sel.priceMax ? Number(sel.priceMax) : undefined,
    });
    router.push(qs ? `/cars?${qs}` : "/cars");
  }

  return (
    <form
      onSubmit={submit}
      className="card relative -mt-14 flex flex-col gap-5 p-5 shadow-lift sm:p-7"
      aria-label="Quick vehicle search"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Brand" value={sel.brand} onChange={set("brand")}>
          <option value="">Any brand</option>
          {options.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Field>

        <Field label="Body type" value={sel.body} onChange={set("body")}>
          <option value="">Any body type</option>
          {options.bodyTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Field>

        <Field label="Fuel" value={sel.fuel} onChange={set("fuel")}>
          <option value="">Any fuel</option>
          {options.fuelTypes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Field>

        <Field
          label="Transmission"
          value={sel.transmission}
          onChange={set("transmission")}
        >
          <option value="">Any transmission</option>
          {options.transmissions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Field>

        <Field label="Year from" value={sel.yearMin} onChange={set("yearMin")}>
          <option value="">Any year</option>
          {options.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Field>

        <Field
          label="Max price"
          value={sel.priceMax}
          onChange={set("priceMax")}
        >
          <option value="">No maximum</option>
          {priceTiers.map((p) => (
            <option key={p} value={p}>
              Up to {formatPriceCompact(p, "XAF")}
            </option>
          ))}
        </Field>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tiny car travelling along a line as fields are filled */}
        <div className="relative hidden h-6 flex-1 sm:block" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: `calc(${progress * 100}% - 14px)` }}
          >
            <CarGlyph className="h-4 w-8 text-accent" />
          </div>
        </div>

        <button
          type="submit"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-strong sm:w-auto"
        >
          <Search className="size-4" aria-hidden />
          Search Cars
        </button>
      </div>
    </form>
  );
}
