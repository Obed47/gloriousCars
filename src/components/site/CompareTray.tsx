"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { GitCompareArrows, X } from "lucide-react";
import { useCompare } from "@/components/providers/CompareProvider";
import type { VehicleSummary } from "@/lib/types";
import { vehicleTitle } from "@/lib/slug";

export function CompareTray({ summaries }: { summaries: VehicleSummary[] }) {
  const { compareIds, removeCompare, clearCompare, count, max, hydrated } =
    useCompare();

  const selected = compareIds
    .map((id) => summaries.find((s) => s.id === id))
    .filter((s): s is VehicleSummary => Boolean(s));

  const open = hydrated && selected.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl sm:inset-x-0 sm:bottom-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label="Vehicle comparison tray"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:pl-5">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-ink">
                  {count} of {max} selected
                </p>
                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  Clear all
                </button>
              </div>
              <ul className="flex items-center gap-2">
                {selected.map((s) => (
                  <li key={s.id} className="relative">
                    <Image
                      src={s.image}
                      alt={vehicleTitle(s)}
                      width={64}
                      height={44}
                      className="h-11 w-16 rounded-md object-cover ring-1 ring-black/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeCompare(s.id)}
                      aria-label={`Remove ${vehicleTitle(s)} from comparison`}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-white shadow-sm transition-transform hover:scale-110"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </li>
                ))}
                {Array.from({ length: Math.max(0, max - selected.length) }, (_, i) => (
                  <li
                    key={`slot-${i}`}
                    className="h-11 w-16 rounded-md border border-dashed border-line-strong"
                    aria-hidden
                  />
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted hover:bg-black/5 hover:text-ink sm:hidden"
              >
                Clear
              </button>
              <Link
                href="/compare"
                className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong sm:flex-none"
              >
                <GitCompareArrows className="size-4" aria-hidden />
                Compare
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
