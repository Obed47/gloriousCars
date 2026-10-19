import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeCta } from "@/components/home/HomeCta";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/locales";
import { SITE } from "@/lib/site";

// Nested under the `[lang]` segment, so this page's own `params` already
// carry `lang` — no need for `next/root-params`'s `lang()` here for the
// metadata, same as src/app/[lang]/cars/page.tsx.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const { canonical, languages } = localePaths("/about", locale);
  const description = `${SITE.name} ${dict.about.metadata.descriptionSuffix}`;

  return {
    title: dict.about.metadata.title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${dict.about.metadata.title} | ${SITE.name}`,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
    },
  };
}

export default async function AboutPage() {
  const dict = await getDictionary();

  return (
    <>
      <section className="section-y">
        <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow={dict.about.hero.eyebrow}
              title={dict.about.hero.title}
              description={dict.about.hero.description}
            />
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
              {SITE.stats.map((s) => (
                <div key={s.key} className="flex flex-col gap-1">
                  <dt className="text-3xl font-extrabold tracking-tight text-ink">
                    {s.value}
                  </dt>
                  <dd className="text-sm text-muted">{dict.stats[s.key]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">
              {dict.about.hero.statsDisclaimer}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
              <VehicleImage
                src="/hero_cars.png"
                alt={dict.about.hero.imageAlt}
                fit="contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-3">
          <SectionHeading
            eyebrow={dict.about.approach.eyebrow}
            title={dict.about.approach.title}
          />
          <div className="flex flex-col gap-4 text-[0.9375rem] leading-relaxed text-muted lg:col-span-2">
            {dict.about.approach.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />
      <HomeCta />
    </>
  );
}
