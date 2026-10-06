import type { ReactNode } from "react";
import type { VehicleStatus } from "@/lib/types";

type Tone = "featured" | "available" | "reserved" | "sold" | "neutral";

const tones: Record<Tone, string> = {
  featured: "bg-ink text-white",
  available: "bg-positive/12 text-positive ring-1 ring-positive/25",
  reserved: "bg-amber-500/14 text-amber-700 ring-1 ring-amber-500/30",
  sold: "bg-slate/10 text-muted ring-1 ring-black/10",
  neutral: "bg-mist text-muted ring-1 ring-black/[0.06]",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status: VehicleStatus): Tone {
  return status === "Available"
    ? "available"
    : status === "Reserved"
      ? "reserved"
      : "sold";
}
