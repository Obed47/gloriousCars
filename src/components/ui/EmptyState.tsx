import type { ReactNode } from "react";
import { CarGlyph } from "./icons";

export function EmptyState({
  title = "No vehicles found",
  description = "Try adjusting your filters or search.",
  action,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-20 text-center ${className}`}
    >
      <CarGlyph className="h-12 w-24 text-silver [animation:emptyBounce_2.4s_ease-in-out_infinite]" />
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-bold text-ink">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
