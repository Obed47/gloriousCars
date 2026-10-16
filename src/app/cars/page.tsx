import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllVehicles, getFilterOptions } from "@/lib/repository";
import { InventoryBrowser } from "@/components/cars/InventoryBrowser";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cars for Sale in Yaoundé & Douala, Cameroon",
  description: `Browse cars for sale in Yaoundé, Douala and across Cameroon at ${SITE.name}. Filter by brand, price, body type, fuel and more, then book a test drive.`,
  alternates: { canonical: "/cars" },
  openGraph: {
    title: `Cars for Sale in Yaoundé & Douala, Cameroon | ${SITE.name}`,
    description: `Browse inspected cars for sale in Yaoundé, Douala and across Cameroon.`,
    url: "/cars",
  },
};

export default async function CarsPage() {
  const [vehicles, options] = await Promise.all([
    getAllVehicles(),
    getFilterOptions(),
  ]);

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <header className="wrap">
        <SectionHeading
          as="h1"
          eyebrow="Inventory"
          title="Cars for sale in Yaoundé & Douala"
          description="Compare inspected vehicles available in Yaoundé, Douala and across Cameroon, with transparent prices and direct WhatsApp support."
        />
      </header>

      <div className="mt-10 lg:mt-14">
        <Suspense
          fallback={
            <div className="wrap">
              <VehicleGridSkeleton count={9} />
            </div>
          }
        >
          <InventoryBrowser vehicles={vehicles} options={options} />
        </Suspense>
      </div>
    </div>
  );
}
