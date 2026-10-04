"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const carsY = useTransform(
    smoothProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "8%"],
  );
  const carsScale = useTransform(
    smoothProgress,
    [0, 1],
    [1, reduced ? 1 : 1.04],
  );

  return (
    <section
      ref={heroRef}
      id="home-hero"
      className="relative isolate min-h-[74vh] overflow-hidden bg-ink text-white sm:min-h-[88vh]"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,rgba(36,40,44,0.72),transparent_56%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink to-transparent"
        aria-hidden
      />
      <MotionLines reduced={reduced} />

      <div className="wrap relative z-10 flex min-h-[74vh] flex-col items-center pb-5 pt-12 text-center sm:min-h-[88vh] sm:pb-8 sm:pt-20">
        <motion.div
          className="max-w-4xl"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.03em] sm:text-6xl lg:text-[5.8rem]">
            Find the right car,
            <br />
            <span className="text-accent">ready to drive.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-silver sm:text-base">
            Browse quality cars for sale in Yaoundé, Douala and across Cameroon,
            compare your options and find one that fits your life.
          </p>
          <div className="mt-7 flex justify-center">
            <Button href="/cars" size="md" withArrow>
              Explore Cars
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-6 w-full max-w-360 sm:mt-8"
          style={{ y: carsY, scale: carsScale }}
          initial={reduced ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-x-[10%] bottom-[5%] h-8 rounded-[50%] bg-black/60 blur-2xl"
            aria-hidden
          />
          <Image
            src="/hero_cars.png"
            alt="A lineup of trusted vehicles available at Glorious Cars"
            width={2048}
            height={683}
            preload
            sizes="(max-width: 640px) 100vw, 90rem"
            className="relative z-10 h-auto max-h-[34vh] w-full object-contain object-bottom saturate-[0.72]"
          />
        </motion.div>
      </div>
    </section>
  );
}

function MotionLines({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {[18, 38, 58, 78].map((top, i) => (
          <motion.line
            key={top}
            x1="-5%"
            x2="105%"
            y1={`${top}%`}
            y2={`${top - 6}%`}
            stroke="white"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              reduced
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 1, opacity: [0, 1, 0.5] }
            }
            transition={{
              duration: 2.4,
              delay: i * 0.25,
              repeat: reduced ? 0 : Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
