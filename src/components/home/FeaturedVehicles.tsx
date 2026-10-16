import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Vehicle } from "@/lib/types";

export async function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;
  const dict = await getDictionary();

  return (
    <section id="featured" className="section-y scroll-mt-24">
      <div className="wrap">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={dict.home.featuredVehicles.eyebrow}
            title={dict.home.featuredVehicles.title}
            description={dict.home.featuredVehicles.description}
          />
          <Button
            href="/cars"
            variant="outline"
            withArrow
            className="shrink-0 self-start sm:self-auto"
          >
            {dict.home.featuredVehicles.viewAll}
          </Button>
        </div>

        <div className="mt-12">
          <VehicleGrid vehicles={vehicles} priorityCount={3} />
        </div>
      </div>
    </section>
  );
}
