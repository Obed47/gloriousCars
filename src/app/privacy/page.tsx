import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} handles your information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="wrap max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 rounded-lg bg-mist px-4 py-3 text-sm text-muted">
        This is placeholder text for the demo. Replace it with a policy reviewed
        by your legal advisor before going live.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-[0.9375rem] leading-relaxed text-muted">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">Information we collect</h2>
          <p>
            When you book a test drive or send an enquiry, we collect the
            details you provide — such as your name, phone number and email — so
            that we can respond and arrange your appointment. Favorites and
            comparison selections are stored only in your browser.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">How we use it</h2>
          <p>
            We use your information solely to answer your enquiry, arrange test
            drives, and complete a purchase if you choose to proceed. We do not
            sell your data.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">WhatsApp</h2>
          <p>
            Messages you send us via WhatsApp are subject to WhatsApp&apos;s own
            privacy terms in addition to ours.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">Contact</h2>
          <p>
            Questions about your data? Email{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-accent hover:underline"
            >
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
