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
import { Badge, statusLabel, statusTone } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";

// Nested under the `[lang]` segment, so this page's own `params` already
// carry `lang` — no need for `next/root-params`'s `lang()` here for the
// metadata, same as src/app/[lang]/cars/page.tsx.
function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (LOCALES as readonly string[]).includes(value)
  );
}

type Params = { lang: Locale; brand: string; slug: string };

export async function generateStaticParams(): Promise<
  Omit<Params, "lang">[]
> {
  const vehicles = await getAllVehicles();
  return vehicles.map((v) => ({ brand: brandSlug(v), slug: vehicleSlug(v) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, brand, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const vehicle = await getVehicleBySlugs(brand, slug);
  if (!vehicle) return { title: "Vehicle not found" };

  const full = vehicleFullTitle(vehicle);
  const title = `${full} ${dict.vehicleDetail.metadata.forSaleSuffix}`;
  const description = `${dict.vehicleDetail.metadata.exploreVehiclePrefix} ${full} — ${formatPrice(
    vehicle.price,
    vehicle.currency,
  )}, ${formatMileage(vehicle.mileage)}, ${vehicle.fuelType}, ${
    vehicle.transmission
  }. ${dict.vehicleDetail.metadata.descriptionSuffix} ${SITE.name}.`;
  const { canonical, languages } = localePaths(
    vehiclePath(vehicle),
    locale,
  );

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE.name}`,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
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

  const [related, dict] = await Promise.all([
    getRelatedVehicles(vehicle, 3),
    getDictionary(),
  ]);
  const full = vehicleFullTitle(vehicle);
  const path = vehiclePath(vehicle);

  return (
    <div className="pb-28 pt-6 lg:pb-16">
      <VehicleJsonLd vehicle={vehicle} url={`${SITE.url}${path}`} />
      <BreadcrumbJsonLd
        items={[
          { name: SITE.name, path: "/" },
          { name: dict.vehicleDetail.breadcrumb.carsForSale, path: "/cars" },
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
          aria-label={dict.vehicleDetail.breadcrumb.ariaLabel}
          className="flex flex-wrap items-center gap-1 text-xs text-muted"
        >
          <Link href="/" className="hover:text-ink">
            {dict.nav.home}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link href="/cars" className="hover:text-ink">
            {dict.nav.cars}
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
                    {statusLabel(vehicle.status, dict)}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-4" aria-hidden />
                  {dict.vehicleDetail.summary.availableInPrefix}{" "}
                  {vehicle.location}
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface p-4 text-center">
                {[
                  {
                    label: dict.vehicleDetail.summary.mileageLabel,
                    value: formatMileage(vehicle.mileage),
                  },
                  {
                    label: dict.vehicleDetail.summary.fuelLabel,
                    value: vehicle.fuelType,
                  },
                  {
                    label: dict.vehicleDetail.summary.gearboxLabel,
                    value: vehicle.transmission,
                  },
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
                {dict.vehicleDetail.summary.referencePrefix}{" "}
                {vehicle.reference} ·{" "}
                {dict.vehicleDetail.summary.listedForSaleByPrefix}{" "}
                {SITE.legalName}
              </p>
            </div>
          </div>
        </div>

        {/* Specs */}
        <section className="mt-16">
          <SectionHeading
            eyebrow={dict.vehicleDetail.headings.specsEyebrow}
            title={dict.vehicleDetail.headings.specsTitle}
            as="h2"
          />
          <div className="mt-6">
            <SpecGrid vehicle={vehicle} dict={dict} />
          </div>
        </section>

        {/* About */}
        <section className="mt-16 max-w-3xl">
          <SectionHeading
            eyebrow={dict.vehicleDetail.headings.aboutEyebrow}
            title={dict.vehicleDetail.headings.aboutTitle}
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
              eyebrow={dict.vehicleDetail.headings.relatedEyebrow}
              title={dict.vehicleDetail.headings.relatedTitle}
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
