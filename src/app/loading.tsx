import { CarLoader } from "@/components/ui/CarLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <CarLoader label="Loading" />
    </div>
  );
}
