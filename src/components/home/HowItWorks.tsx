"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarGlyph } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse our collection and filter down to the vehicles that fit your life.",
  },
  {
    n: "02",
    title: "Explore",
    body: "Check the specifications, the full image gallery and pricing.",
  },
  {
    n: "03",
    title: "Experience",
    body: "Book a test drive at a date, time and location that suit you.",
  },
  {
    n: "04",
    title: "Drive away",
    body: "Talk to our team on WhatsApp, visit us and complete your purchase.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });
  const carLeft = useTransform(progress, [0, 1], ["0%", "100%"]);
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section className="section-y bg-graphite text-white">
      <div className="wrap">
        <SectionHeading
          eyebrow="How It Works"
          title="Four steps from first look to first drive"
          tone="light"
          align="center"
          className="mx-auto"
        />

        <div ref={ref} className="relative mt-16">
          {/* Track */}
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-white/15 lg:block"
            aria-hidden
          />
          <motion.div
            className="absolute left-0 top-6 hidden h-px origin-left bg-accent lg:block lg:right-0"
            style={{ scaleX: reduced ? 1 : lineScale }}
            aria-hidden
          />
          {!reduced && (
            <motion.div
              className="absolute top-6 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
              style={{ left: carLeft }}
              aria-hidden
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-accent shadow-[0_0_0_6px_rgba(23,105,255,0.18)]">
                <CarGlyph className="h-4 w-7 text-white" />
              </span>
            </motion.div>
          )}

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step) => (
              <li key={step.n} className="relative flex flex-col gap-3">
                <span
                  className="hidden size-3 rounded-full bg-accent ring-4 ring-graphite lg:block"
                  aria-hidden
                />
                <span className="text-sm font-bold tracking-[0.2em] text-accent-on-dark">
                  {step.n}
                </span>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-silver">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
