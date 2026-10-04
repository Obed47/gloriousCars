import { VehicleCard } from "./VehicleCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Vehicle } from "@/lib/types";

export function VehicleGrid({
  vehicles,
  priorityCount = 0,
  columns = 3,
  className = "",
}: {
  vehicles: Vehicle[];
  priorityCount?: number;
  /** "sidebar": 3 columns only from xl, when the grid sits beside filters. */
  columns?: 2 | 3 | "sidebar";
  className?: string;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === "sidebar"
        ? "sm:grid-cols-2 xl:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-6 ${cols} ${className}`}>
      {vehicles.map((vehicle, i) => (
        <Reveal
          key={vehicle.id}
          delay={(i % 3) * 0.08}
          y={18}
          className="h-full"
        >
          <VehicleCard vehicle={vehicle} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
