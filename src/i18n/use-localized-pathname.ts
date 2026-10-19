"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "./locales";
import { stripLocalePrefix } from "./paths";

/**
 * The current page's unprefixed path and locale. Read this, never
 * `usePathname()` directly, for any routing logic (active nav links, route
 * checks, building links): `usePathname()` returns the proxy's internal
 * rewritten path (`/en/cars`) during server rendering but the browser's path
 * (`/cars`) on hydration, so comparing it against `/cars` gives the server
 * and the client different answers. Both normalise to
 * `{ pathname: "/cars", locale: "en" }` here.
 */
export function useLocalizedPathname(): { pathname: string; locale: Locale } {
  return stripLocalePrefix(usePathname());
}

/** The current locale, read off the URL (`/fr…` → French, anything else → English). */
export function useLocale(): Locale {
  return useLocalizedPathname().locale;
}
