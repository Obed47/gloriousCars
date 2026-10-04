"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCompare } from "@/components/providers/CompareProvider";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatMileage, formatNumber, formatPrice } from "@/lib/format";
import { vehiclePath, vehicleFullTitle } from "@/lib/slug";
import { buildWhatsAppUrl, vehicleInquiryMessage } from "@/lib/whatsapp";
import type { Vehicle } from "@/lib/types";

type Row = {
  label: string;
  value: (v: Vehicle) => string;
  metric?: (v: Vehicle) => number;
  best?: "min" | "max";
};

const ROWS: Row[] = [
  { label: "Price", value: (v) => formatPrice(v.price, v.currency), metric: (v) => v.price, best: "min" },
  { label: "Year", value: (v) => String(v.year), metric: (v) => v.year, best: "max" },
  { label: "Mileage", value: (v) => formatMileage(v.mileage), metric: (v) => v.mileage, best: "min" },
  { label: "Body type", value: (v) => v.bodyType },
  { label: "Engine", value: (v) => v.engine },
  { label: "Horsepower", value: (v) => `${formatNumber(v.horsepower)} hp`, metric: (v) => v.horsepower, best: "max" },
  { label: "Fuel", value: (v) => v.fuelType },
  { label: "Transmission", value: (v) => v.transmission },
  { label: "Drive type", value: (v) => v.driveType },
  { label: "Seats", value: (v) => String(v.seats), metric: (v) => v.seats, best: "max" },
  { label: "Condition", value: (v) => v.condition },
  { label: "Location", value: (v) => v.location },
];

export function CompareView({ vehicles }: { vehicles: Vehicle[] }) {
  const { compareIds, removeCompare, clearCompare, hydrated, max } = useCompare();

  if (!hydrated) return <VehicleGridSkeleton count={3} />;

  const selected = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  if (selected.length === 0) {
    return (
      <EmptyState
        title="Nothing to compare yet"
        description={`Add up to ${max} vehicles using the compare button on any card, then see them side by side here.`}
        action={
          <Button href="/cars" withArrow>
            Browse all cars
          </Button>
        }
      />
    );
  }

  const colWidth = "min-w-[200px]";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          Comparing {selected.length} of {max}
        </p>
        <button
          type="button"
          onClick={clearCompare}
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-36 min-w-36 bg-surface p-4 text-left align-bottom" />
              {selected.map((v) => (
                <th
                  key={v.id}
                  className={`${colWidth} border-l border-line p-4 text-left align-top`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-graphite">
                      {v.images[0] && (
                        <Image
                          src={v.images[0].url}
                          alt=""
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeCompare(v.id)}
                        aria-label={`Remove ${vehicleFullTitle(v)}`}
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink/80 text-white hover:bg-ink"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <Link
                      href={vehiclePath(v)}
                      className="font-bold leading-snug text-ink hover:text-accent"
                    >
                      {vehicleFullTitle(v)}
                    </Link>
                  </div>
                </th>
              ))}
              {selected.length < max && (
                <th className={`${colWidth} border-l border-line p-4 align-middle`}>
                  <Link
                    href="/cars"
                    className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-8 text-sm font-medium text-muted hover:border-ink hover:text-ink"
                  >
                    <Plus className="size-5" aria-hidden />
                    Add vehicle
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const metrics = row.metric ? selected.map(row.metric) : [];
              const target =
                row.metric && row.best
                  ? row.best === "min"
                    ? Math.min(...metrics)
                    : Math.max(...metrics)
                  : null;
              const values = selected.map(row.value);
              const allSame = new Set(values).size === 1 && selected.length > 1;

              return (
                <tr key={row.label} className="border-t border-line">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-surface p-4 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-muted"
                  >
                    {row.label}
                  </th>
                  {selected.map((v, i) => {
                    const isBest =
                      target != null &&
                      row.metric &&
                      row.metric(v) === target &&
                      selected.length > 1;
                    return (
                      <td
                        key={v.id}
                        className={`${colWidth} border-l border-line p-4 font-semibold ${
                          isBest
                            ? "bg-accent-soft text-accent"
                            : allSame
                              ? "text-muted"
                              : "text-ink"
                        }`}
                      >
                        {values[i]}
                        {isBest && (
                          <span className="ml-1.5 text-[0.625rem] font-bold uppercase">
                            Best
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {selected.length < max && <td className="border-l border-line" />}
                </tr>
              );
            })}

            <tr className="border-t border-line">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-surface p-4 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-muted"
              >
                Enquire
              </th>
              {selected.map((v) => (
                <td key={v.id} className={`${colWidth} border-l border-line p-4`}>
                  <a
                    href={buildWhatsAppUrl(vehicleInquiryMessage(v))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-xs font-semibold text-[#053019] hover:bg-[#20bd5a]"
                  >
                    <WhatsAppIcon className="size-4" />
                    WhatsApp
                  </a>
                </td>
              ))}
              {selected.length < max && <td className="border-l border-line" />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
