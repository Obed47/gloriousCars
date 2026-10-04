"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { VEHICLE_IMAGE_BUCKET } from "@/lib/images";

/**
 * Browser-side photo upload. Photos go straight from the browser to Supabase
 * Storage (authorised by the staff session and the bucket's policies) rather
 * than through a Server Action, whose request body is capped at 1 MB by
 * default; a phone photo is several MB.
 */

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const IMAGE_ACCEPT = ACCEPTED_TYPES.join(",");

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.88;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // matches the bucket's file_size_limit

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

let client: ReturnType<typeof createSupabaseBrowserClient> | undefined;
const supabase = () => (client ??= createSupabaseBrowserClient());

interface Prepared {
  blob: Blob;
  contentType: string;
}

/**
 * Re-encodes to a JPEG no larger than MAX_DIMENSION. That keeps uploads and
 * page weight small, applies the camera's rotation, and drops EXIF metadata
 * (phones embed GPS coordinates). Falls back to the original file if the
 * browser cannot decode it (e.g. AVIF on an older browser).
 */
async function prepare(file: File): Promise<Prepared> {
  const original: Prepared = { blob: file, contentType: file.type };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return original;
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.fillStyle = "#ffffff"; // JPEG has no alpha; flatten transparent PNGs onto white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob ? { blob, contentType: "image/jpeg" } : original;
  } finally {
    bitmap.close();
  }
}

function explain(message: string): string {
  if (/bucket not found/i.test(message)) {
    return "Photo storage is not set up yet. Run the storage migration (20260920010000_vehicle_images_storage.sql) in Supabase.";
  }
  if (/row-level security|unauthorized|not authorized|permission|jwt/i.test(message)) {
    return "You don't have permission to upload photos. Try signing out and back in.";
  }
  return `Upload failed: ${message}`;
}

export interface UploadedImage {
  url: string;
  /** Object path inside the bucket. */
  path: string;
}

export async function uploadVehicleImage(file: File): Promise<UploadedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: only JPEG, PNG, WebP or AVIF photos can be uploaded.`);
  }

  const { blob, contentType } = await prepare(file);
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is too large (max 10 MB).`);
  }

  const path = `vehicles/${crypto.randomUUID()}.${EXTENSIONS[contentType] ?? "jpg"}`;
  const { error } = await supabase()
    .storage.from(VEHICLE_IMAGE_BUCKET)
    .upload(path, blob, {
      contentType,
      cacheControl: "31536000", // file names are unique, so cache for a year
      upsert: false,
    });
  if (error) throw new Error(explain(error.message));

  const { data } = supabase().storage.from(VEHICLE_IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Best-effort removal of a file that was uploaded but never saved. */
export async function discardUploadedImage(path: string): Promise<void> {
  try {
    await supabase().storage.from(VEHICLE_IMAGE_BUCKET).remove([path]);
  } catch {
    // An orphaned file is harmless; don't surface it.
  }
}
