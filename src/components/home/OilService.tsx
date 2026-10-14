import Image from "next/image";
import { Cog, Droplet, ShieldCheck, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import engineOil from "../../../public/services/engine-oil.jpg";

const POINTS = [
  {
    Icon: Droplet,
    title: "Quality engine oil",
    body: "Fresh, sealed oil in the grade your engine calls for — synthetic or semi-synthetic.",
  },
  {
    Icon: Cog,
    title: "Gearbox oil",
    body: "The right fluid for manual or automatic gearboxes, for smooth, quiet shifting.",
  },
  {
    Icon: Wrench,
    title: "Changed before delivery",
    body: "Old oil drained and new oil filled to the correct level by our team, before the keys are in your hands.",
  },
];

export function OilService() {
  return (
    <section
      id="oil-service"
      className="section-y relative scroll-mt-24 overflow-hidden bg-ink text-white"
    >
      {/* Warm glow echoing the oil photo */}
      <div
        className="pointer-events-none absolute -left-40 top-1/2 size-[40rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(232_163_37/0.14),transparent)]"
        aria-hidden
      />

      {/* Mobile reads heading → photo → points; desktop puts the photo in its
          own column beside the heading and points. */}
      <div className="wrap relative grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
        <Reveal className="lg:col-start-2 lg:self-end">
          <SectionHeading
            eyebrow="Before key handover"
            tone="light"
            title="Fresh engine & gearbox oil in every car"
            description="Before any car leaves us, we replace its engine and gearbox oil with quality oil of the correct grade. You drive away on fresh oil from day one, with nothing to sort out yourself."
          />
        </Reveal>

        <Reveal className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-lift sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={engineOil}
              alt="Clean golden engine oil being poured into a car engine"
              fill
              placeholder="blur"
              quality={70}
              sizes="(max-width: 1024px) 100vw, 40vw"
              // Wide crops keep the spout and the start of the pour in frame.
              className="object-cover object-[50%_22%] lg:object-center"
            />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-graphite p-3 sm:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white sm:size-10">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <p className="text-sm leading-snug text-silver">
              <span className="block font-semibold text-white">
                Matched to your car
              </span>
              Oil chosen to your manufacturer&rsquo;s specification.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-start-2 lg:self-start">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-1">
            {POINTS.map(({ Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-4 sm:flex-col sm:gap-3 lg:flex-row lg:gap-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-accent-on-dark">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-silver">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
