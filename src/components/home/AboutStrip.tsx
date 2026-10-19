import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { getDictionary } from "@/i18n/get-dictionary";
import { SITE } from "@/lib/site";

export async function AboutStrip() {
  const dict = await getDictionary();

  return (
    <section className="section-y bg-surface">
      <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Same artwork as the hero just above, so only shown side by side. */}
        <Reveal className="hidden lg:block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
            <VehicleImage
              src="/hero_cars.png"
              alt={dict.home.aboutStrip.imageAlt}
              fit="contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <SectionHeading
            eyebrow={dict.home.aboutStrip.eyebrow}
            title={dict.home.aboutStrip.title}
            description={dict.home.aboutStrip.description}
          />

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {SITE.stats.map((stat) => (
              <div key={stat.key} className="flex flex-col gap-1">
                <dt className="text-3xl font-extrabold tracking-tight text-ink">
                  {stat.value}
                </dt>
                <dd className="text-sm text-muted">{dict.stats[stat.key]}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <Button href="/about" variant="outline" withArrow>
              {dict.home.aboutStrip.cta}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
