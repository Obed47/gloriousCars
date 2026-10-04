"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { VEHICLE_IMAGE_BUCKET, storagePathFromUrl } from "@/lib/images";
import { slugify } from "@/lib/slug";
import type { VehicleImage } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { vehicleToRow } from "@/lib/supabase/vehicles";
import {
  STATUSES,
  draftFromFormData,
  validateDraft,
  type SaveState,
} from "@/lib/admin/vehicleForm";

/** Public pages are prerendered; refresh them after any catalogue change. */
function refreshSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function storedImageUrls(supabase: ServerClient, id: string): Promise<string[]> {
  const { data } = await supabase.from("vehicles").select("images").eq("id", id).maybeSingle();
  return ((data?.images as VehicleImage[] | undefined) ?? []).map((image) => image.url);
}

/**
 * Deletes uploaded files (only ones in our own bucket) that no vehicle refers
 * to any more. Best effort: a leftover file is harmless, so it never fails a save.
 */
async function removeStoredImages(supabase: ServerClient, urls: string[]) {
  const paths = urls.map(storagePathFromUrl).filter((path): path is string => path !== null);
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove(paths);
  } catch {
    // ignore
  }
}

function newVehicleId(brand: string, model: string, trim: string | undefined, year: number) {
  const slug = slugify(`${brand} ${model} ${trim ?? ""} ${year}`);
  return `v-${slug}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function saveVehicle(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  // The staff check and the read of the current photos are independent network
  // calls, so overlap them. Nothing is written until the check has passed.
  const supabase = await createSupabaseServerClient();
  const [, previousUrls] = await Promise.all([
    requireStaff(),
    id ? storedImageUrls(supabase, id) : Promise.resolve([] as string[]),
  ]);

  const draft = draftFromFormData(formData);
  const result = validateDraft(draft);
  if (!result.ok) {
    return { draft, errors: result.errors, message: "Please fix the highlighted fields." };
  }

  const row = vehicleToRow(result.value);

  let error;
  if (id) {
    const res = await supabase.from("vehicles").update(row).eq("id", id).select("id");
    error = res.error;
    if (!res.error && res.data.length === 0) {
      console.error(
        `[admin] saveVehicle: update of "${id}" matched no rows (vehicle missing, or blocked by row-level security for this user).`,
      );
      return { draft, errors: {}, message: "That vehicle no longer exists, or you can't edit it." };
    }
    if (!res.error) {
      const kept = new Set(result.value.images.map((image) => image.url));
      await removeStoredImages(supabase, previousUrls.filter((url) => !kept.has(url)));
    }
  } else {
    const { brand, model, trim, year } = result.value;
    const res = await supabase
      .from("vehicles")
      .insert({ id: newVehicleId(brand, model, trim, year), ...row });
    error = res.error;
  }

  if (error) {
    if (error.code === "23505") {
      return { draft, errors: { reference: "This reference is already used by another vehicle." } };
    }
    console.error(`[admin] saveVehicle (${id ? `update ${id}` : "insert"}) failed:`, error);
    return { draft, errors: {}, message: `Could not save: ${error.message}` };
  }

  refreshSite();
  redirect("/admin");
}

export async function setVehicleStatus(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid status update.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("vehicles").update({ status }).eq("id", id);
  if (error) throw new Error(`Could not update status: ${error.message}`);
  refreshSite();
}

export async function setVehicleFeatured(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";
  if (!id) throw new Error("Invalid featured update.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("vehicles").update({ featured }).eq("id", id);
  if (error) throw new Error(`Could not update featured flag: ${error.message}`);
  refreshSite();
}

export async function deleteVehicle(formData: FormData) {
  const staff = await requireStaff();
  if (staff.role !== "admin") throw new Error("Only administrators can delete vehicles.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid delete request.");

  const supabase = await createSupabaseServerClient();
  const imageUrls = await storedImageUrls(supabase, id);
  const { data, error } = await supabase.from("vehicles").delete().eq("id", id).select("id");
  if (error) throw new Error(`Could not delete vehicle: ${error.message}`);
  if (data.length === 0) throw new Error("Vehicle not found, or you don't have permission to delete it.");
  await removeStoredImages(supabase, imageUrls);
  refreshSite();
}
