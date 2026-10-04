import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { Button } from "@/components/ui/Button";
import type { Vehicle } from "@/lib/types";

export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;

  return (
    <section id="featured" className="section-y scroll-mt-24">
      <div className="wrap">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured Vehicles"
            title="Some of our most sought-after cars"
            description="Hand-picked from current stock. Pick one to see the full gallery, specs and to book a test drive."
          />
          <Button
            href="/cars"
            variant="outline"
            withArrow
            className="shrink-0 self-start sm:self-auto"
          >
            View all vehicles
          </Button>
        </div>

        <div className="mt-12">
          <VehicleGrid vehicles={vehicles} priorityCount={3} />
        </div>
      </div>
    </section>
  );
}
