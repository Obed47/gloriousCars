"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarGlyph } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useDictionary } from "@/i18n/dictionary-context";

const STEP_NUMBERS = ["01", "02", "03", "04"];

export function HowItWorks() {
  const dict = useDictionary();
  const steps = dict.home.howItWorks.steps.map((step, i) => ({
    ...step,
    n: STEP_NUMBERS[i],
  }));
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
          eyebrow={dict.home.howItWorks.eyebrow}
          title={dict.home.howItWorks.title}
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
            {steps.map((step) => (
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
