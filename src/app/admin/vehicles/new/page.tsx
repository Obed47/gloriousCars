import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { emptyDraft } from "@/lib/admin/vehicleForm";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Add vehicle" };

export default async function NewVehiclePage() {
  await requireStaff();

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <h1 className="text-3xl font-bold text-ink">Add vehicle</h1>
      <VehicleForm vehicleId={null} initial={emptyDraft()} />
    </div>
  );
}
