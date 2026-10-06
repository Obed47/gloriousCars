import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";

import {
  getAllVehicles,
  getRelatedVehicles,
  getVehicleBySlugs,
} from "@/lib/repository";
import {
  brandSlug,
  vehicleFullTitle,
  vehiclePath,
  vehicleSlug,
} from "@/lib/slug";
import { formatMileage, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

import { Gallery } from "@/components/detail/Gallery";
import { SpecGrid } from "@/components/detail/SpecGrid";
import { AboutVehicle } from "@/components/detail/AboutVehicle";
import { DetailCTAs } from "@/components/detail/DetailCTAs";
import { DetailSaveRow } from "@/components/detail/DetailSaveRow";
import { VehicleJsonLd } from "@/components/detail/VehicleJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { Badge, statusTone } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Params = { brand: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const vehicles = await getAllVehicles();
  return vehicles.map((v) => ({ brand: brandSlug(v), slug: vehicleSlug(v) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { brand, slug } = await params;
  const vehicle = await getVehicleBySlugs(brand, slug);
  if (!vehicle) return { title: "Vehicle not found" };

  const full = vehicleFullTitle(vehicle);
  const title = `${full} for sale`;
  const description = `Explore the ${full} — ${formatPrice(
    vehicle.price,
    vehicle.currency,
  )}, ${formatMileage(vehicle.mileage)}, ${vehicle.fuelType}, ${
    vehicle.transmission
  }. Full specifications, images and test-drive availability at ${SITE.name}.`;
  const path = vehiclePath(vehicle);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE.name}`,
      description,
      url: path,
      images: vehicle.images.slice(0, 3).map((img) => ({
        url: img.url,
        alt: `${full} — ${img.angle}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: [vehicle.images[0]?.url].filter(Boolean) as string[],
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brand, slug } = await params;
  const vehicle = await getVehicleBySlugs(brand, slug);
  if (!vehicle) notFound();

  const related = await getRelatedVehicles(vehicle, 3);
  const full = vehicleFullTitle(vehicle);
  const path = vehiclePath(vehicle);

  return (
    <div className="pb-28 pt-6 lg:pb-16">
      <VehicleJsonLd vehicle={vehicle} url={`${SITE.url}${path}`} />
      <BreadcrumbJsonLd
        items={[
          { name: SITE.name, path: "/" },
          { name: "Cars for sale", path: "/cars" },
          {
            name: vehicle.brand,
            path: `/cars?brand=${encodeURIComponent(vehicle.brand)}`,
          },
          { name: full, path },
        ]}
      />

      <div className="wrap">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-xs text-muted"
        >
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link href="/cars" className="hover:text-ink">
            Cars
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link
            href={`/cars?brand=${encodeURIComponent(vehicle.brand)}`}
            className="hover:text-ink"
          >
            {vehicle.brand}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-ink">{vehicle.name}</span>
        </nav>

        {/* Gallery + summary */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <Gallery images={vehicle.images} title={full} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <span className="eyebrow text-muted">{vehicle.brand}</span>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {full}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-2xl font-extrabold tracking-tight text-ink">
                    {formatPrice(vehicle.price, vehicle.currency)}
                  </p>
                  <Badge tone={statusTone(vehicle.status)}>
                    {vehicle.status}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-4" aria-hidden />
                  Available in {vehicle.location}
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface p-4 text-center">
                {[
                  { label: "Mileage", value: formatMileage(vehicle.mileage) },
                  { label: "Fuel", value: vehicle.fuelType },
                  { label: "Gearbox", value: vehicle.transmission },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted">
                      {s.label}
                    </dt>
                    <dd className="text-[0.8125rem] font-bold text-ink">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <DetailCTAs vehicle={vehicle} />
              <DetailSaveRow vehicle={vehicle} />

              <p className="text-center text-xs text-muted">
                Reference {vehicle.reference} · Listed for sale by{" "}
                {SITE.legalName}
              </p>
            </div>
          </div>
        </div>

        {/* Specs */}
        <section className="mt-16">
          <SectionHeading
            eyebrow="At a glance"
            title="Key specifications"
            as="h2"
          />
          <div className="mt-6">
            <SpecGrid vehicle={vehicle} />
          </div>
        </section>

        {/* About */}
        <section className="mt-16 max-w-3xl">
          <SectionHeading
            eyebrow="Overview"
            title="About this vehicle"
            as="h2"
          />
          <div className="mt-6">
            <AboutVehicle description={vehicle.description} />
          </div>
        </section>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-line bg-surface py-16">
          <div className="wrap">
            <SectionHeading
              eyebrow="You might also like"
              title="Similar vehicles"
              as="h2"
            />
            <div className="mt-10">
              <VehicleGrid vehicles={related} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
