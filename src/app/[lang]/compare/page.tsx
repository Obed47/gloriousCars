import type { Metadata } from "next";
import { getAllVehicles } from "@/lib/repository";
import { CompareView } from "@/components/compare/CompareView";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const { canonical, languages } = localePaths("/compare", locale);

  return {
    title: dict.compare.metadata.title,
    description: dict.compare.metadata.description,
    alternates: { canonical, languages },
    // Not SEO-visible either way, so this needs no locale-specific change.
    robots: { index: false, follow: true },
  };
}

export default async function ComparePage() {
  const [vehicles, dict] = await Promise.all([getAllVehicles(), getDictionary()]);

  return (
    <div className="wrap py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow={dict.compare.heading.eyebrow}
        title={dict.compare.heading.title}
        description={dict.compare.heading.description}
      />
      <div className="mt-10">
        <CompareView vehicles={vehicles} />
      </div>
    </div>
  );
}
