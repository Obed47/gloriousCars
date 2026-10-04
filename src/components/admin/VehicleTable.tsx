"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { STATUSES } from "@/lib/admin/vehicleForm";
import { createMatcher, type AdminVehicleRow } from "@/lib/admin/vehicleSearch";
import { formatPrice } from "@/lib/format";
import {
  deleteVehicle,
  setVehicleFeatured,
  setVehicleStatus,
} from "@/app/admin/actions";

/**
 * The vehicle list with a search box. All rows are already in the browser, so
 * filtering is instant (no round trip to the server per keystroke). The term
 * is mirrored into the URL (`?q=`) so a refresh or a shared link keeps it.
 */
export function VehicleTable({
  rows,
  isAdmin,
  initialQuery,
}: {
  rows: AdminVehicleRow[];
  isAdmin: boolean;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => rows.filter(createMatcher(query)), [rows, query]);
  const searching = query.trim() !== "";

  useEffect(() => {
    const url = new URL(window.location.href);
    const term = query.trim();
    if (term) url.searchParams.set("q", term);
    else url.searchParams.delete("q");
    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url);
    }
  }, [query]);

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="search" className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search name, reference, year, colour, location…"
            aria-label="Search vehicles"
            autoComplete="off"
            spellCheck={false}
            className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-10 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-mist hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        <p aria-live="polite" className="text-sm text-muted">
          {searching
            ? `Showing ${visible.length} of ${rows.length} vehicles`
            : `${rows.length} ${rows.length === 1 ? "vehicle" : "vehicles"}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center text-sm text-muted">
          <p>
            No vehicles match <strong className="text-ink">“{query.trim()}”</strong>.
          </p>
          <button
            type="button"
            onClick={clear}
            className="font-semibold text-accent hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-208 text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{v.title}</div>
                    <div className="text-xs text-muted">
                      {v.reference} · {v.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {formatPrice(v.price, v.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setVehicleStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={v.id} />
                      <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                      <select
                        name="status"
                        defaultValue={v.status}
                        aria-label={`Status for ${v.title}`}
                        className="h-8 rounded-md border border-line-strong bg-surface px-2 text-xs text-ink"
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-[0.8125rem] font-semibold text-accent hover:underline"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={setVehicleFeatured}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="featured" value={String(!v.featured)} />
                      <button
                        type="submit"
                        className="text-[0.8125rem] font-semibold text-accent hover:underline"
                      >
                        {v.featured ? "Unfeature" : "Feature"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/vehicles/${v.id}/edit`}
                        className="text-[0.8125rem] font-semibold text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      {v.publicPath && (
                        <Link
                          href={v.publicPath}
                          className="text-[0.8125rem] font-semibold text-muted hover:text-ink"
                        >
                          View
                        </Link>
                      )}
                      {isAdmin && (
                        <form action={deleteVehicle}>
                          <input type="hidden" name="id" value={v.id} />
                          <DeleteButton label={v.title} />
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
