"use client";

import { ChevronDown } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-context";
import { SORT_OPTIONS } from "@/lib/filtering";
import type { SortKey } from "@/lib/types";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  const dict = useDictionary();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">
        {dict.cars.sort.label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          className="h-10 appearance-none rounded-lg border border-line-strong bg-surface pl-3 pr-9 text-sm font-semibold text-ink outline-none transition-colors hover:border-ink focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          aria-label={dict.cars.sort.ariaLabel}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {dict.cars.sortOptions[o.key]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </label>
  );
}
