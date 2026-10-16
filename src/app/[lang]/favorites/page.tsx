import type { Metadata } from "next";
import { getAllVehicles } from "@/lib/repository";
import { FavoritesView } from "@/components/favorites/FavoritesView";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "My Favorites",
  description: "Vehicles you've saved.",
  robots: { index: false, follow: true },
};

export default async function FavoritesPage() {
  const vehicles = await getAllVehicles();

  return (
    <div className="wrap py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Saved for later"
        title="My favorites"
        description="Your shortlist, kept on this device. Come back any time to pick up where you left off."
      />
      <div className="mt-10">
        <FavoritesView vehicles={vehicles} />
      </div>
    </div>
  );
}
