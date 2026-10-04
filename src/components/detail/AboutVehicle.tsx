"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function AboutVehicle({
  description,
  highlights,
}: {
  description: string;
  highlights: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 280;

  return (
    <div className="flex flex-col gap-5">
      <p
        className={`text-[0.9375rem] leading-relaxed text-muted transition-all ${
          isLong && !expanded ? "line-clamp-4" : ""
        }`}
      >
        {description}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-accent"
          aria-expanded={expanded}
        >
          {expanded ? "Read less" : "Read more"}
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      )}

      {highlights.length > 0 && (
        <ul className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex items-center gap-2.5 rounded-lg bg-mist px-3 py-2.5 text-sm font-medium text-ink"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
