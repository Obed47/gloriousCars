"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RotateCw } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent">{dict.errorPage.eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {dict.errorPage.title}
        </h1>
        <p className="mx-auto max-w-md text-muted">
          {dict.errorPage.description}
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCw className="size-4" aria-hidden />
        {dict.errorPage.tryAgain}
      </Button>
    </div>
  );
}
