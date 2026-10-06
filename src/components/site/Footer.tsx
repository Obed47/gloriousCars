import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./Logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
} from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const SERVICES = [
  { href: "/services#sales", label: "Vehicle Sales" },
  { href: "/services#test-drives", label: "Test Drives" },
  { href: "/services#consultation", label: "Vehicle Consultation" },
  { href: "/services#assistance", label: "Financing & Assistance" },
];

const SOCIAL = [
  { href: SITE.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: SITE.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: SITE.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  { href: SITE.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-silver">
      <div className="wrap grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-20">
        <div className="flex flex-col gap-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-silver/80">
            {SITE.description}
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

        <nav aria-label="Footer navigation" className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">Navigation</h2>
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-silver/85 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Services" className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">Services</h2>
          {SERVICES.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-silver/85 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="eyebrow text-white">Contact</h2>
          <a
            href={`tel:${SITE.phoneDisplay.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 text-sm text-silver/85 transition-colors hover:text-white"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            {SITE.phoneDisplay}
          </a>
          <a
            href={buildWhatsAppUrl(generalInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-silver/85 transition-colors hover:text-white"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            Chat on WhatsApp
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
              {SITE.address.line}
              <br />
              {SITE.address.city}, {SITE.address.country}
            </span>
          </p>
          <ul className="mt-1 space-y-1 text-xs text-silver/80">
            {SITE.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs text-silver/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
