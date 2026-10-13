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
import { SITE } from "@/lib/site";
import {
  buildWhatsAppUrl,
  generalInquiryMessage,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Services",
  description: `Vehicle sales, test drives, consultation and buying assistance from ${SITE.name}, with fresh engine and gearbox oil in every car we deliver.`,
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    id: "sales",
    Icon: Car,
    title: "Vehicle Sales",
    body: "A curated, inspected inventory across brands and budgets. Browse online, filter to what fits, and reserve the car you want.",
    cta: { label: "Browse inventory", href: "/cars" },
  },
  {
    id: "test-drives",
    Icon: CalendarCheck,
    title: "Test Drives",
    body: "Book a test drive at a date, time and location that work for you. We can bring the vehicle to a location near you where possible.",
    cta: { label: "See available cars", href: "/cars" },
  },
  {
    id: "consultation",
    Icon: MessagesSquare,
    title: "Vehicle Consultation",
    body: "Not sure which car suits your needs? Tell us your budget, usage and priorities and we will shortlist options — honestly, including ones we do not have in stock.",
    cta: {
      label: "Ask our team",
      href: buildWhatsAppUrl(generalInquiryMessage()),
      external: true,
    },
  },
  {
    id: "assistance",
    Icon: Banknote,
    title: "Financing & Assistance",
    body: "Guidance through paperwork, transfer, insurance introductions and financing partners. We keep the process moving so you can drive away sooner.",
    cta: {
      label: "Talk about options",
      href: buildWhatsAppUrl(generalInquiryMessage()),
      external: true,
    },
  },
  {
    id: "oil-service",
    Icon: Droplet,
    title: "Engine & Gearbox Oil",
    body: "Every car we deliver gets fresh, quality engine and gearbox oil, matched to the manufacturer's specification and changed by our team before handover.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="section-y">
        <div className="wrap">
          <SectionHeading
            as="h1"
            eyebrow="Services"
            title="Everything around the car, handled"
            description="From first search to signed paperwork, these are the ways we help you move."
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
            Have a question about any of this?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              href={buildWhatsAppUrl(generalInquiryMessage())}
              external
              variant="whatsapp"
              size="lg"
            >
              <WhatsAppIcon className="size-5" />
              Message us on WhatsApp
            </Button>
            <Button href="/contact" size="lg" variant="outline-light">
              Contact page
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
