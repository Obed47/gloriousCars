import { requireStaff } from "@/lib/auth";
import { listAllVehicles } from "@/lib/admin/vehicles";
import { toAdminRow } from "@/lib/admin/vehicleSearch";
import { Button } from "@/components/ui/Button";
import { VehicleTable } from "@/components/admin/VehicleTable";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Run the staff check and the list query together (one round trip, not two).
  const [staff, vehicles, params] = await Promise.all([
    requireStaff(),
    listAllVehicles(),
    searchParams,
  ]);

  // The search box opens pre-filled from ?q= (a refresh or a shared link).
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = (q ?? "").slice(0, 200);

  const count = (status: string) => vehicles.filter((v) => v.status === status).length;
  const stats = [
    { label: "Total", value: vehicles.length },
    { label: "Available", value: count("Available") },
    { label: "Reserved", value: count("Reserved") },
    { label: "Sold", value: count("Sold") },
    { label: "Featured", value: vehicles.filter((v) => v.featured).length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold text-ink">Vehicles</h1>
        <Button href="/admin/vehicles/new" size="md">
          Add vehicle
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {s.label}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>

      {vehicles.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          No vehicles yet. Add your first vehicle to publish it on the site.
        </div>
      ) : (
        <VehicleTable
          rows={vehicles.map(toAdminRow)}
          isAdmin={staff.role === "admin"}
          initialQuery={initialQuery}
        />
      )}
    </div>
  );
}
