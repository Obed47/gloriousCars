"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type Tag = "div" | "section" | "li" | "article" | "span";

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  article: motion.article,
  span: motion.span,
} as const;

export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  y = 22,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered container — pair with <Reveal> children given incremental delays. */
export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
