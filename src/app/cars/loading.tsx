import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CarsLoading() {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <div className="wrap flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="wrap mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[270px_1fr] lg:gap-12">
        <div className="hidden flex-col gap-4 lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <VehicleGridSkeleton count={9} />
      </div>
    </div>
  );
}
