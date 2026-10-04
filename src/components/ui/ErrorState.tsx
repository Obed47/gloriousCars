"use client";

import { RotateCw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the vehicles right now. Please try again.",
  onRetry,
  className = "",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 rounded-xl border border-line bg-surface px-6 py-20 text-center ${className}`}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-mist text-muted">
        <RotateCw className="size-5" aria-hidden />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-bold text-ink">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
