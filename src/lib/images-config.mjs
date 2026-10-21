
const VEHICLE_IMAGE_BUCKET = "vehicle-images";

const STORAGE_PREFIX =
  `/storage/v1/object/public/${VEHICLE_IMAGE_BUCKET}/`;

function supabaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!raw) return null;

  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function imageRemotePatterns() {
  const patterns = [];
  const supabase = supabaseUrl();

  if (supabase) {
    patterns.push({
      protocol: supabase.protocol === "http:" ? "http" : "https",
      hostname: supabase.hostname,
      ...(supabase.port ? { port: supabase.port } : {}),
      pathname: `${STORAGE_PREFIX}**`,
    });
  }

  return patterns;
}

export { VEHICLE_IMAGE_BUCKET, STORAGE_PREFIX, supabaseUrl };
