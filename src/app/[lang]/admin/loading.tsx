// Shown while the staff pages load. It is scoped to /admin so the public
// vehicle pages can return a real 404 status: a root-level loading boundary
// would start streaming every page before a missing vehicle is detected.
import { CarLoader } from "@/components/ui/CarLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <CarLoader label="Loading" />
    </div>
  );
}
