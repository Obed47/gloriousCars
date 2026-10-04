import type { Metadata } from "next";
import { getAllVehicles } from "@/lib/repository";
import { CompareView } from "@/components/compare/CompareView";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Compare vehicles",
  description: "Compare up to three vehicles side by side.",
  robots: { index: false, follow: true },
};

export default async function ComparePage() {
  const vehicles = await getAllVehicles();

  return (
    <div className="wrap py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Side by side"
        title="Compare vehicles"
        description="Line up the numbers that matter — price, mileage, power and more — and see the differences at a glance."
      />
      <div className="mt-10">
        <CompareView vehicles={vehicles} />
      </div>
    </div>
  );
}
