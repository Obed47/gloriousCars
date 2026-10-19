import { Button } from "@/components/ui/Button";
import { CarGlyph } from "@/components/ui/icons";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function VehicleNotFound() {
  const dict = await getDictionary();

  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <CarGlyph className="h-16 w-32 text-silver" />
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent">{dict.notFound.vehicle.eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {dict.notFound.vehicle.title}
        </h1>
        <p className="mx-auto max-w-md text-muted">
          {dict.notFound.vehicle.description}
        </p>
      </div>
      <Button href="/cars" withArrow>
        {dict.notFound.vehicle.browseAllCars}
      </Button>
    </div>
  );
}
