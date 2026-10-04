"use client";

import { ChevronDown } from "lucide-react";
import { formatMileage, formatPriceCompact } from "@/lib/format";
import type { FilterOptions, VehicleQuery } from "@/lib/types";

type Patch = Partial<VehicleQuery>;

function toggle(list: string[] | undefined, value: string): string[] {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set];
}

function Group({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {count ? (
            <span className="rounded-full bg-accent px-1.5 text-[0.625rem] font-bold leading-4 text-white">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className="size-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </details>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted transition-colors hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-line-strong text-accent accent-accent focus-visible:ring-2 focus-visible:ring-accent/30"
      />
      {label}
    </label>
  );
}

function MiniSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-line bg-surface pl-2.5 pr-8 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </label>
  );
}

export function FilterPanel({
  options,
  query,
  onChange,
  onReset,
}: {
  options: FilterOptions;
  query: VehicleQuery;
  onChange: (patch: Patch) => void;
  onReset: () => void;
}) {
  const priceTiers: number[] = [];
  {
    const [min, max] = options.priceRange;
    const step = 10000;
    const start = Math.floor(min / step) * step;
    for (let p = start; p <= max + step; p += step) priceTiers.push(p);
  }
  const mileageTiers = [
    10000, 20000, 30000, 40000, 50000, 75000, 100000,
  ].filter((m) => m <= options.mileageRange[1] + 25000);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-bold text-ink">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-accent underline-offset-2 hover:underline"
        >
          Reset all
        </button>
      </div>

      <Group title="Brand" count={query.brand?.length}>
        {options.brands.map((b) => (
          <Check
            key={b}
            label={b}
            checked={query.brand?.includes(b) ?? false}
            onChange={() => onChange({ brand: toggle(query.brand, b) })}
          />
        ))}
      </Group>

      <Group title="Body type" count={query.bodyType?.length}>
        {options.bodyTypes.map((b) => (
          <Check
            key={b}
            label={b}
            checked={query.bodyType?.includes(b) ?? false}
            onChange={() => onChange({ bodyType: toggle(query.bodyType, b) })}
          />
        ))}
      </Group>

      <Group title="Price">
        <div className="flex gap-3">
          <MiniSelect
            label="Min"
            value={query.minPrice}
            onChange={(v) => onChange({ minPrice: v ? Number(v) : undefined })}
          >
            <option value="">Any</option>
            {priceTiers.map((p) => (
              <option key={p} value={p}>
                {formatPriceCompact(p, "XAF")}
              </option>
            ))}
          </MiniSelect>
          <MiniSelect
            label="Max"
            value={query.maxPrice}
            onChange={(v) => onChange({ maxPrice: v ? Number(v) : undefined })}
          >
            <option value="">Any</option>
            {priceTiers.map((p) => (
              <option key={p} value={p}>
                {formatPriceCompact(p, "XAF")}
              </option>
            ))}
          </MiniSelect>
        </div>
      </Group>

      <Group title="Year">
        <div className="flex gap-3">
          <MiniSelect
            label="From"
            value={query.minYear}
            onChange={(v) => onChange({ minYear: v ? Number(v) : undefined })}
          >
            <option value="">Any</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </MiniSelect>
          <MiniSelect
            label="To"
            value={query.maxYear}
            onChange={(v) => onChange({ maxYear: v ? Number(v) : undefined })}
          >
            <option value="">Any</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </MiniSelect>
        </div>
      </Group>

      <Group title="Max mileage">
        <MiniSelect
          label="Up to"
          value={query.maxMileage}
          onChange={(v) => onChange({ maxMileage: v ? Number(v) : undefined })}
        >
          <option value="">Any mileage</option>
          {mileageTiers.map((m) => (
            <option key={m} value={m}>
              {formatMileage(m)}
            </option>
          ))}
        </MiniSelect>
      </Group>

      <Group title="Fuel" count={query.fuelType?.length}>
        {options.fuelTypes.map((f) => (
          <Check
            key={f}
            label={f}
            checked={query.fuelType?.includes(f) ?? false}
            onChange={() => onChange({ fuelType: toggle(query.fuelType, f) })}
          />
        ))}
      </Group>

      <Group title="Transmission" count={query.transmission?.length}>
        {options.transmissions.map((t) => (
          <Check
            key={t}
            label={t}
            checked={query.transmission?.includes(t) ?? false}
            onChange={() =>
              onChange({ transmission: toggle(query.transmission, t) })
            }
          />
        ))}
      </Group>

      <Group title="Condition" count={query.condition?.length}>
        {options.conditions.map((c) => (
          <Check
            key={c}
            label={c}
            checked={query.condition?.includes(c) ?? false}
            onChange={() => onChange({ condition: toggle(query.condition, c) })}
          />
        ))}
      </Group>

      <Group title="Colour" count={query.color?.length} defaultOpen={false}>
        {options.colors.map((c) => (
          <Check
            key={c}
            label={c}
            checked={query.color?.includes(c) ?? false}
            onChange={() => onChange({ color: toggle(query.color, c) })}
          />
        ))}
      </Group>
    </div>
  );
}
