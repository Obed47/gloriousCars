import type { ReactNode } from "react";

/** Small uppercase label with a leading rule — the section "kicker". */
export function Eyebrow({
  children,
  className = "",
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  const color = tone === "light" ? "text-silver" : "text-muted";
  const rule = tone === "light" ? "bg-silver/50" : "bg-line-strong";
  return (
    <span
      className={`eyebrow inline-flex items-center gap-3 ${color} ${className}`}
    >
      <span className={`h-px w-8 ${rule}`} aria-hidden />
      {children}
    </span>
  );
}
