import { lang } from "next/root-params";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { FacebookIcon } from "@/components/ui/icons";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleLink } from "@/i18n/locale-link";
import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/locales";
import { SITE, SITE_COPY } from "@/lib/site";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

// Footer is a Server Component: it reads the root `[lang]` param straight
// off `next/root-params` (the same mechanism `getDictionary` uses), rather
// than prop-drilling through the layout or becoming a Client Component.


const SOCIAL = [
  { href: SITE.social.facebook, label: "Facebook", Icon: FacebookIcon },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const dict = await getDictionary();
  const localeParam = await lang();
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const SERVICES = [
    { href: "/services#sales", label: dict.footer.services.sales },
    { href: "/services#test-drives", label: dict.footer.services.testDrives },
    { href: "/services#consultation", label: dict.footer.services.consultation },
    { href: "/services#assistance", label: dict.footer.services.assistance },
  ];

  const NAV = [
    { href: "/", label: dict.nav.home },
    { href: "/cars", label: dict.nav.cars },
    { href: "/about", label: dict.nav.about },
    { href: "/services", label: dict.nav.services },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <footer className="bg-ink text-silver">
      <div className="wrap grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-20">
        <div className="flex flex-col gap-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-silver/80">
            {SITE_COPY[locale].description}
          </p>
          <div className="mt-2 flex gap-2">
            {SOCIAL.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-white/12 text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={dict.footer.navigationLabel} className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">{dict.footer.navigationHeading}</h2>
          {NAV.map((l) => (
            <LocaleLink
              key={l.href}
              href={l.href}
              className="text-sm text-silver/85 transition-colors hover:text-white"
            >
              {l.label}
            </LocaleLink>
          ))}
        </nav>

        <nav aria-label={dict.footer.servicesHeading} className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">{dict.footer.servicesHeading}</h2>
          {SERVICES.map((l) => (
            <LocaleLink
              key={l.href}
              href={l.href}
              className="text-sm text-silver/85 transition-colors hover:text-white"
            >
              {l.label}
            </LocaleLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">{dict.footer.contactHeading}</h2>
          <a
            href={`tel:${SITE.phoneDisplay.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 text-sm text-silver/85 transition-colors hover:text-white"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            {SITE.phoneDisplay}
          </a>
          <a
            href={buildWhatsAppUrl(generalInquiryMessage(dict))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-silver/85 transition-colors hover:text-white"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            {dict.footer.chatOnWhatsapp}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-2.5 text-sm text-silver/85 transition-colors hover:text-white"
          >
            <Mail className="size-4 shrink-0" aria-hidden />
            {SITE.email}
          </a>
          <p className="flex items-start gap-2.5 text-sm text-silver/85">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {dict.footer.addressLine}
              <br />
              {SITE.address.city}, {dict.footer.country}
            </span>
          </p>
          <ul className="mt-1 space-y-1 text-xs text-silver/80">
            {SITE.hours.map((h) => (
              <li key={h.key} className="flex justify-between gap-4">
                <span>{dict.footer.hours[h.key]}</span>
                <span>{"timeKey" in h ? dict.footer[h.timeKey] : h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs text-silver/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.legalName}. {dict.footer.rightsReserved}
          </p>
          <div className="flex gap-6">
            <LocaleLink href="/privacy" className="hover:text-white">
              {dict.footer.privacyPolicy}
            </LocaleLink>
            <LocaleLink href="/terms" className="hover:text-white">
              {dict.footer.terms}
            </LocaleLink>
            <LanguageSwitcher />
            {/* Staff pages are English-only and never locale-prefixed. */}
            <Link href="/login" className="text-silver/40 hover:text-silver/70">
              {dict.footer.staffLogin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
