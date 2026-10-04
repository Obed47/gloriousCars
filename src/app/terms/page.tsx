import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms for using the ${SITE.name} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="wrap max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 rounded-lg bg-mist px-4 py-3 text-sm text-muted">
        This is placeholder text for the demo. Replace it with terms reviewed by
        your legal advisor before going live.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-[0.9375rem] leading-relaxed text-muted">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">Vehicle information</h2>
          <p>
            We take care to describe every vehicle accurately, including
            mileage, specification and condition. Listings are not a contractual
            offer; availability and price are confirmed at the point of sale.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">Test drives</h2>
          <p>
            Test drive requests are subject to confirmation by our team and to
            presenting a valid driving licence. Requested times are preferences,
            not guaranteed bookings.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">No online payment</h2>
          <p>
            This website does not process payments. Any purchase is completed
            directly with {SITE.legalName}.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">Liability</h2>
          <p>
            The website is provided &ldquo;as is&rdquo;. To the extent permitted
            by law, {SITE.legalName} is not liable for indirect or consequential
            loss arising from use of the site.
          </p>
        </section>
      </div>
    </div>
  );
}
