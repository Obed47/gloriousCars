export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Card placeholder matching the VehicleCard footprint. */
export function VehicleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}
