import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getVehicleForAdmin } from "@/lib/admin/vehicles";
import { draftFromVehicle } from "@/lib/admin/vehicleForm";
import { vehicleFullTitle } from "@/lib/slug";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Each Supabase call is a network round trip, so run them together instead
  // of one after another. The vehicle is only used if requireStaff() passes
  // (it redirects otherwise), and row-level security guards the read anyway.
  const [, vehicle] = await Promise.all([requireStaff(), getVehicleForAdmin(id)]);
  if (!vehicle) notFound();

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="eyebrow text-muted">Edit vehicle</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {vehicleFullTitle(vehicle)}
        </h1>
      </div>
      <VehicleForm vehicleId={vehicle.id} initial={draftFromVehicle(vehicle)} />
    </div>
  );
}
