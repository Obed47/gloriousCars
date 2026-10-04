import { Button } from "@/components/ui/Button";
import { CarGlyph } from "@/components/ui/icons";

export default function VehicleNotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <CarGlyph className="h-16 w-32 text-silver" />
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent">Vehicle unavailable</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          We couldn&apos;t find that vehicle
        </h1>
        <p className="mx-auto max-w-md text-muted">
          It may have been sold or the link has changed. Browse our current
          stock to find your next car.
        </p>
      </div>
      <Button href="/cars" withArrow>
        Browse all cars
      </Button>
    </div>
  );
}
