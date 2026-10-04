import type { Vehicle } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rowToVehicle, type VehicleRow } from "@/lib/supabase/vehicles";

/**
 * Admin-side reads. These use the signed-in staff session (not the public
 * client), so row-level security lets them see every vehicle, including
 * sold ones. Callers must have passed `requireStaff()` first.
 */

export async function listAllVehicles(): Promise<Vehicle[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("listed_at", { ascending: false });
  if (error) throw new Error(`Could not load vehicles: ${error.message}`);
  return (data as VehicleRow[]).map(rowToVehicle);
}

export async function getVehicleForAdmin(id: string): Promise<Vehicle | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load vehicle: ${error.message}`);
  return data ? rowToVehicle(data as VehicleRow) : null;
}
