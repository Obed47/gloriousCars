"use client";

import { Star } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-context";

export function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const dict = useDictionary();
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={dict.common.ratedOutOf.replace("{rating}", String(rating))}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < rounded ? "fill-accent text-accent" : "fill-line text-line"
          }
          aria-hidden
        />
      ))}
    </span>
  );
}
