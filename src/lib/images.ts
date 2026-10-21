/**
 * Where vehicle photos may come from. `next/image` throws on any other
 * host (and that took a public page down once), so anything the admin form
 * accepts must be rejected before it is saved if it isn't in this list too.
 *
 * The allow-list itself lives in `images-config.mjs` (plain JS, no `@/`
 * imports): `next.config.mjs` is loaded by Node directly, with no
 * TypeScript transform, and imports that file for `images.remotePatterns`.
 * This file re-exports the same logic with types for the rest of the app,
 * so there is still exactly one place that decides what's allowed.
 */

import {
  VEHICLE_IMAGE_BUCKET,
  STORAGE_PREFIX,
  supabaseUrl,
  imageRemotePatterns as imageRemotePatternsImpl,
} from "./images-config.mjs";

export { VEHICLE_IMAGE_BUCKET };

export interface ImageRemotePattern {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}

export function imageRemotePatterns(): ImageRemotePattern[] {
  return imageRemotePatternsImpl() as ImageRemotePattern[];
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
