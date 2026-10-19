import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsAppIcon } from "@/components/ui/icons";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/locales";
import { SITE } from "@/lib/site";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

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
  const { canonical, languages } = localePaths("/contact", locale);
  const description = `${dict.contact.metadata.descriptionPrefix} ${SITE.name} ${dict.contact.metadata.descriptionMiddle} ${SITE.address.city}${dict.contact.metadata.descriptionSuffix}`;

  return {
    title: dict.contact.metadata.title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${dict.contact.metadata.title} | ${SITE.name}`,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
    },
  };
}

export default async function ContactPage() {
  const dict = await getDictionary();
  const tel = SITE.phoneDisplay.replace(/\s/g, "");

  return (
    <div className="wrap py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow={dict.contact.hero.eyebrow}
        title={dict.contact.hero.title}
        description={dict.contact.hero.description}
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <a
            href={buildWhatsAppUrl(generalInquiryMessage(dict))}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-5 transition-colors hover:bg-[#25D366]/15"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-[#053019]">
              <WhatsAppIcon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-ink">
                {dict.contact.whatsappCard.title}
              </span>
              <span className="text-sm text-muted">
                {dict.contact.whatsappCard.subtitle}
              </span>
            </span>
          </a>

          <ContactCard
            Icon={Phone}
            title={dict.contact.cards.phone}
            lines={[SITE.phoneDisplay]}
            href={`tel:${tel}`}
          />
          <ContactCard
            Icon={Mail}
            title={dict.contact.cards.email}
            lines={[SITE.email]}
            href={`mailto:${SITE.email}`}
          />
          <ContactCard
            Icon={MapPin}
            title={dict.contact.cards.showroom}
            lines={[
              SITE.address.line,
              `${SITE.address.city}, ${SITE.address.country}`,
            ]}
          />
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-mist text-ink">
                <Clock className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-bold text-ink">
                {dict.contact.openingHours.title}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {SITE.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-6">
                  <span>{h.days}</span>
                  <span className="font-medium text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  Icon,
  title,
  lines,
  href,
}: {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  lines: string[];
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-mist text-ink">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col break-words">
        <span className="text-sm font-bold text-ink">{title}</span>
        {lines.map((l) => (
          <span key={l} className="text-sm text-muted">
            {l}
          </span>
        ))}
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-ink"
    >
      {inner}
    </a>
  ) : (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5">
      {inner}
    </div>
  );
}
