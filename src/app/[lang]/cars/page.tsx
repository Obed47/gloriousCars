import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllVehicles, getFilterOptions } from "@/lib/repository";
import { InventoryBrowser } from "@/components/cars/InventoryBrowser";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/locales";
import { SITE } from "@/lib/site";

// Nested under the `[lang]` segment, so this page's own `params` already
// carry `lang` — no need for `next/root-params`'s `lang()` here for the
// metadata, same as src/app/[lang]/page.tsx.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const { canonical, languages } = localePaths("/cars", locale);
  const description = `${dict.cars.metadata.descriptionPrefix} ${SITE.name}. ${dict.cars.metadata.descriptionSuffix}`;

  return {
    title: dict.cars.metadata.title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${dict.cars.metadata.title} | ${SITE.name}`,
      description: dict.cars.metadata.ogDescription,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
    },
  };
}

export default async function CarsPage() {
  const [vehicles, options, dict] = await Promise.all([
    getAllVehicles(),
    getFilterOptions(),
    getDictionary(),
  ]);

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <header className="wrap">
        <SectionHeading
          as="h1"
          eyebrow={dict.cars.heading.eyebrow}
          title={dict.cars.heading.title}
          description={dict.cars.heading.description}
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
