"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent">Something went wrong</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          We hit a bump in the road
        </h1>
        <p className="mx-auto max-w-md text-muted">
          We couldn&apos;t load this page right now. Please try again — if it
          keeps happening, reach out to our team.
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}
