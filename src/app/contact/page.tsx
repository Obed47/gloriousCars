import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.name} about cars for sale in Yaoundé, Douala and across Cameroon — WhatsApp, phone, email or visit our showroom in ${SITE.address.city}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const tel = SITE.phoneDisplay.replace(/\s/g, "");

  return (
    <div className="wrap py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Talk to our team"
        description="The fastest way to reach us is WhatsApp — most messages get a reply within the hour during opening times."
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <a
            href={buildWhatsAppUrl(generalInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-5 transition-colors hover:bg-[#25D366]/15"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-[#053019]">
              <WhatsAppIcon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-ink">WhatsApp</span>
              <span className="text-sm text-muted">
                Chat with us now — fastest response
              </span>
            </span>
          </a>

          <ContactCard
            Icon={Phone}
            title="Phone"
            lines={[SITE.phoneDisplay]}
            href={`tel:${tel}`}
          />
          <ContactCard
            Icon={Mail}
            title="Email"
            lines={[SITE.email]}
            href={`mailto:${SITE.email}`}
          />
          <ContactCard
            Icon={MapPin}
            title="Showroom"
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
              <span className="text-sm font-bold text-ink">Opening hours</span>
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
