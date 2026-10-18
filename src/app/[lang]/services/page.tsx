import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  CalendarCheck,
  Car,
  Droplet,
  MessagesSquare,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { HowItWorks } from "@/components/home/HowItWorks";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { SITE } from "@/lib/site";
import {
  buildWhatsAppUrl,
  generalInquiryMessage,
} from "@/lib/whatsapp";

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
  const { canonical, languages } = localePaths("/services", locale);
  const description = `${dict.services.metadata.descriptionPrefix} ${SITE.name}${dict.services.metadata.descriptionSuffix}`;

  return {
    title: dict.services.metadata.title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${dict.services.metadata.title} | ${SITE.name}`,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
    },
  };
}

export default async function ServicesPage() {
  const dict = await getDictionary();

  const SERVICES = [
    {
      id: "sales",
      Icon: Car,
      title: dict.services.items.sales.title,
      body: dict.services.items.sales.body,
      cta: { label: dict.services.items.sales.ctaLabel, href: "/cars" },
    },
    {
      id: "test-drives",
      Icon: CalendarCheck,
      title: dict.services.items.testDrives.title,
      body: dict.services.items.testDrives.body,
      cta: { label: dict.services.items.testDrives.ctaLabel, href: "/cars" },
    },
    {
      id: "consultation",
      Icon: MessagesSquare,
      title: dict.services.items.consultation.title,
      body: dict.services.items.consultation.body,
      cta: {
        label: dict.services.items.consultation.ctaLabel,
        href: buildWhatsAppUrl(generalInquiryMessage(dict)),
        external: true,
      },
    },
    {
      id: "assistance",
      Icon: Banknote,
      title: dict.services.items.assistance.title,
      body: dict.services.items.assistance.body,
      cta: {
        label: dict.services.items.assistance.ctaLabel,
        href: buildWhatsAppUrl(generalInquiryMessage(dict)),
        external: true,
      },
    },
    {
      id: "oil-service",
      Icon: Droplet,
      title: dict.services.items.oilService.title,
      body: dict.services.items.oilService.body,
    },
  ];

  return (
    <>
      <section className="section-y">
        <div className="wrap">
          <SectionHeading
            as="h1"
            eyebrow={dict.services.hero.eyebrow}
            title={dict.services.hero.title}
            description={dict.services.hero.description}
            align="center"
            className="mx-auto"
          />

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {SERVICES.map(({ id, Icon, title, body, cta }, i) => (
              <Reveal
                key={id}
                delay={(i % 2) * 0.08}
                // An odd card out spans the row instead of sitting alone.
                className={
                  i === SERVICES.length - 1 && i % 2 === 0
                    ? "md:col-span-2"
                    : undefined
                }
              >
                <article
                  id={id}
                  className="card flex h-full scroll-mt-28 flex-col gap-4 p-7"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h2 className="text-xl font-bold text-ink">{title}</h2>
                  <p className="flex-1 text-sm leading-relaxed text-muted">
                    {body}
                  </p>
                  {cta?.external ? (
                    <a
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 self-start text-sm font-semibold text-accent"
                    >
                      <WhatsAppIcon className="size-4" />
                      {cta.label}
                    </a>
                  ) : cta ? (
                    <Link
                      href={cta.href}
                      className="inline-flex items-center gap-1 self-start text-sm font-semibold text-accent hover:gap-2"
                    >
                      {cta.label} →
                    </Link>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="bg-ink text-white">
        <div className="wrap flex flex-col items-start gap-6 py-16 lg:py-20">
          <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl">
            {dict.services.cta.heading}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              href={buildWhatsAppUrl(generalInquiryMessage(dict))}
              external
              variant="whatsapp"
              size="lg"
            >
              <WhatsAppIcon className="size-5" />
              {dict.services.cta.whatsappButton}
            </Button>
            <Button href="/contact" size="lg" variant="outline-light">
              {dict.services.cta.contactButton}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
