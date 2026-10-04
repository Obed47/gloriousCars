import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeCta } from "@/components/home/HomeCta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `${SITE.name} is a trusted vehicle marketplace for quality cars for sale in Yaoundé, Douala and across Cameroon, built on transparency and direct service.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="section-y">
        <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="About Glorious Cars"
              title="More than a car. A better way to move."
              description="We started Glorious Cars because buying a used car should not require a leap of faith. Every vehicle we list is chosen for quality, inspected properly and described honestly  and a real person is always one message away."
            />
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
              {SITE.stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <dt className="text-3xl font-extrabold tracking-tight text-ink">
                    {s.value}
                  </dt>
                  <dd className="text-sm text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-silver">
              Figures shown are placeholders for this demo.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
              <VehicleImage
                src="/hero_cars.png"
                alt="A lineup of quality vehicles available at Glorious Cars"
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
            eyebrow="Our approach"
            title="Quality first, then everything else"
          />
          <div className="flex flex-col gap-4 text-[0.9375rem] leading-relaxed text-muted lg:col-span-2">
            <p>
              Sourcing is deliberate. We buy vehicles with clean histories and
              verifiable service records, then put each one through a
              multi-point inspection before it is photographed and listed. If a
              car does not meet the standard, it does not go on the site.
            </p>
            <p>
              Information is complete. The mileage on the listing is the mileage
              on the odometer. The photos are the actual car, not a stock image.
              Specifications, features and known imperfections are all
              documented so you can make a decision before you visit.
            </p>
            <p>
              Service is direct. From the first question to the handover of
              keys, you deal with our team over WhatsApp and in person no call
              centres, no scripts, and no pressure to decide on the spot.
            </p>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />
      <HomeCta />
    </>
  );
}
