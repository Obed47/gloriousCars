import { Calendar, Fuel, Gauge, Settings2, Users } from "lucide-react";
import { formatMileage } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    { Icon: Calendar, label: "Year", value: String(vehicle.year) },
    { Icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { Icon: Fuel, label: "Fuel", value: vehicle.fuelType },
    { Icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { Icon: Users, label: "Seats", value: String(vehicle.seats) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-5">
      {specs.map(({ Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-2 bg-surface p-4"
        >
          <Icon className="size-4 text-accent" aria-hidden />
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
            {label}
          </dt>
          <dd className="text-sm font-bold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
