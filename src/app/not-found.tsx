import { Button } from "@/components/ui/Button";
import { CarGlyph } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <CarGlyph className="h-16 w-32 text-silver" />
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent">Error 404</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          This page took a wrong turn
        </h1>
        <p className="mx-auto max-w-md text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on the road.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/" withArrow>
          Back to home
        </Button>
        <Button href="/cars" variant="outline">
          Browse all cars
        </Button>
      </div>
    </div>
  );
}
