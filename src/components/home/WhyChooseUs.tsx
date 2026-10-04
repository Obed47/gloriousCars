import {
  BadgeCheck,
  CalendarCheck,
  FileText,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const REASONS = [
  {
    Icon: BadgeCheck,
    title: "Carefully selected vehicles",
    body: "Every car is chosen with quality and reliability in mind, then inspected before it reaches the listing.",
  },
  {
    Icon: FileText,
    title: "Transparent information",
    body: "Clear specifications, honest pricing, real mileage and full vehicle details — no fine print surprises.",
  },
  {
    Icon: CalendarCheck,
    title: "Easy test drives",
    body: "Choose a date, time and location that suit you. Confirmation comes straight to your phone.",
  },
  {
    Icon: MessagesSquare,
    title: "Direct assistance",
    body: "Talk to our team the moment you have a question — no call queues, no scripts, just answers on WhatsApp.",
  },
  {
    Icon: ShieldCheck,
    title: "Trusted service",
    body: "Professional support from first search to handover, and after you drive away.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-y">
      <div className="wrap">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Buying a car should feel this straightforward"
          align="center"
          className="mx-auto"
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <article
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-6 transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  i === 0
                    ? "min-h-64 border-ink bg-ink text-white lg:col-span-2"
                    : "min-h-56 border-line bg-surface text-ink hover:border-accent/45"
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                      i === 0
                        ? "bg-accent text-white"
                        : "bg-mist text-accent group-hover:bg-accent-soft"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span
                    className={`font-mono text-xs tracking-[0.18em] ${
                      i === 0 ? "text-silver" : "text-muted/60"
                    }`}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div className="mt-10">
                  <h3 className="max-w-sm text-lg font-bold">{title}</h3>
                  <p
                    className={`mt-3 max-w-xl text-sm leading-relaxed ${
                      i === 0 ? "text-silver" : "text-muted"
                    }`}
                  >
                    {body}
                  </p>
                </div>
                <span
                  className={`absolute bottom-0 left-6 h-0.5 w-10 origin-left transition-all duration-300 group-hover:w-20 ${
                    i === 0 ? "bg-accent" : "bg-accent/45"
                  }`}
                  aria-hidden
                />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
