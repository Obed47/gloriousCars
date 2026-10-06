/**
 * Reads a saved list of vehicle ids from localStorage. Anything that is not an
 * array of strings is ignored, so a corrupt value cannot crash the site.
 */
export function parseStoredIds(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [];
}
