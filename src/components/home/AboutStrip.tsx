import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { SITE } from "@/lib/site";

export function AboutStrip() {
  return (
    <section className="section-y bg-surface">
      <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Same artwork as the hero just above, so only shown side by side. */}
        <Reveal className="hidden lg:block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
            <VehicleImage
              src="/hero_cars.png"
              alt="A lineup of quality vehicles available at Glorious Cars"
              fit="contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <SectionHeading
            eyebrow="About Glorious Cars"
            title="More than a car. A better way to move."
            description="Every vehicle we list is chosen for quality and reliability, inspected properly, and described honestly — the mileage is the mileage and the photos are the actual car. From first search to signed paperwork, a real person is one WhatsApp message away."
          />

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {SITE.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="text-3xl font-extrabold tracking-tight text-ink">
                  {stat.value}
                </dt>
                <dd className="text-sm text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <Button href="/about" variant="outline" withArrow>
              Our story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
