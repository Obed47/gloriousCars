/**
 * Where vehicle photos may come from. This is the single source of truth for
 * both `next.config.ts` (`images.remotePatterns`) and the admin form's
 * validation. `next/image` throws on any other host (and that took a public
 * page down once), so anything else must be rejected before it is saved.
 *
 * No `@/` imports: `next.config.ts` imports this file directly.
 */

export const VEHICLE_IMAGE_BUCKET = "vehicle-images";

/** Public object URLs look like `<project>/storage/v1/object/public/<bucket>/<path>`. */
const STORAGE_PREFIX = `/storage/v1/object/public/${VEHICLE_IMAGE_BUCKET}/`;

export interface ImageRemotePattern {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}

function supabaseUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function imageRemotePatterns(): ImageRemotePattern[] {
  const patterns: ImageRemotePattern[] = [];

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

export function isAllowedImageUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  return imageRemotePatterns().some(
    (p) =>
      `${p.protocol}:` === url.protocol &&
      p.hostname === url.hostname &&
      (p.port ?? "") === url.port &&
      (!p.pathname || url.pathname.startsWith(p.pathname.replace(/\*\*$/, ""))),
  );
}

/** Object path inside the bucket for one of our own uploads, else `null`. */
export function storagePathFromUrl(raw: string): string | null {
  const supabase = supabaseUrl();
  if (!supabase) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.host !== supabase.host || !url.pathname.startsWith(STORAGE_PREFIX)) {
    return null;
  }
  try {
    return decodeURIComponent(url.pathname.slice(STORAGE_PREFIX.length)) || null;
  } catch {
    return null;
  }
}
