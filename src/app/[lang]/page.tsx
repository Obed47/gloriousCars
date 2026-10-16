import { Hero } from "@/components/home/Hero";
import { QuickSearch } from "@/components/home/QuickSearch";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { OilService } from "@/components/home/OilService";
import { AboutStrip } from "@/components/home/AboutStrip";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BrandStrip } from "@/components/home/BrandStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { HomeCta } from "@/components/home/HomeCta";
import {
  getBrandsWithCounts,
  getFeaturedVehicles,
  getFilterOptions,
  getReviews,
} from "@/lib/repository";
import type { Metadata } from "next";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { SITE } from "@/lib/site";

// This page is the `[lang]` segment itself, so its own `params` already
// carry `lang` — no need for `next/root-params`'s `lang()` here, unlike
// shared components such as Footer.tsx.
function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (LOCALES as readonly string[]).includes(value)
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const { canonical, languages } = localePaths("/", locale);

  return {
    title: dict.home.metadata.title,
    description: dict.home.metadata.description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      title: `${SITE.name} | ${dict.home.metadata.title}`,
      description: dict.home.metadata.description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
    },
  };
}

export default async function HomePage() {
  const [featured, options, brands, reviews] = await Promise.all([
    getFeaturedVehicles(6),
    getFilterOptions(),
    getBrandsWithCounts(),
    getReviews(),
  ]);

  return (
    <>
      <Hero />

      <div className="wrap relative z-20">
        <QuickSearch options={options} />
      </div>

      <FeaturedVehicles vehicles={featured} />
      <OilService />
      <AboutStrip />
      <WhyChooseUs />
      <HowItWorks />
      <BrandStrip brands={brands} />
      <Testimonials reviews={reviews} />
      <HomeCta />
    </>
  );
}
