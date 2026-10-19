import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

/**
 * Splits a pathname into its locale and its unprefixed path: `/fr/cars` →
 * `{ locale: "fr", pathname: "/cars" }`, `/en/cars` and `/cars` →
 * `{ locale: "en", pathname: "/cars" }`, `/fr` → `{ locale: "fr", pathname: "/" }`.
 *
 * `usePathname()` reports `/en/cars` while a page renders on the server
 * (proxy.ts rewrites unprefixed English URLs into the `[lang]` segment) but
 * `/cars` once it hydrates in the browser; both normalise to the same result
 * here, which is what keeps server and client markup in agreement.
 */
export function stripLocalePrefix(pathname: string | null | undefined): {
  locale: Locale;
  pathname: string;
} {
  const path = pathname || "/";
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return { locale, pathname: path.slice(prefix.length) || "/" };
    }
  }
  return { locale: DEFAULT_LOCALE, pathname: path };
}

/**
 * Builds the href for an internal, unprefixed path in `locale`: English URLs
 * stay unprefixed, French ones gain `/fr` (the French root is `/fr`, not
 * `/fr/`). A query string or hash is carried over untouched, and a path that
 * already carries a locale prefix is re-targeted rather than double-prefixed.
 * Anything that isn't a root-relative path (`#main`, `mailto:`, `https://…`,
 * protocol-relative `//host`) is returned as-is.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const suffixAt = href.search(/[?#]/);
  const rawPath = suffixAt === -1 ? href : href.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? "" : href.slice(suffixAt);
  const { pathname } = stripLocalePrefix(rawPath);

  if (locale === DEFAULT_LOCALE) return `${pathname}${suffix}`;
  return `${pathname === "/" ? `/${locale}` : `/${locale}${pathname}`}${suffix}`;
}
