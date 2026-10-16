import { DEFAULT_LOCALE, type Locale } from "./locales";

/** What the proxy should do with a request, decided from its path, cookie and headers. */
export type LocaleAction =
  | { kind: "next" }
  | { kind: "rewrite"; path: string }
  | { kind: "redirect"; path: string };

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Staff pages: always English, and the only paths that need the Supabase session. */
export function isStaffPath(pathname: string): boolean {
  return hasPrefix(pathname, "/admin") || hasPrefix(pathname, "/login");
}

/** Whether the highest-weighted entry of an Accept-Language header is French. */
export function prefersFrench(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;

  const entries = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q, index };
    })
    // q=0 means "not acceptable".
    .filter((entry) => entry.tag !== "" && entry.q > 0);

  if (entries.length === 0) return false;

  // Highest weight first; ties keep header order.
  entries.sort((a, b) => b.q - a.q || a.index - b.index);
  return entries[0].tag.split("-")[0] === "fr";
}

/**
 * Locale cascade. Order matters: staff paths are checked before the cookie is
 * read, so /admin and /login are English whatever the visitor's preference.
 */
export function resolveLocaleAction(
  pathname: string,
  cookieLocale: string | null,
  acceptLanguage: string | null,
): LocaleAction {
  if (hasPrefix(pathname, "/en")) {
    return { kind: "redirect", path: pathname.slice("/en".length) || "/" };
  }

  if (isStaffPath(pathname)) {
    return { kind: "rewrite", path: `/en${pathname}` };
  }

  if (hasPrefix(pathname, "/fr")) {
    // Staff pages have no French version; send /fr/admin and /fr/login back to
    // the unprefixed path so they go through the forced-English rule above.
    const unprefixed = pathname.slice("/fr".length) || "/";
    if (isStaffPath(unprefixed)) return { kind: "redirect", path: unprefixed };
    return { kind: "next" };
  }

  const locale: Locale =
    cookieLocale === "en" || cookieLocale === "fr"
      ? cookieLocale
      : prefersFrench(acceptLanguage)
        ? "fr"
        : DEFAULT_LOCALE;

  if (locale === "fr") {
    return { kind: "redirect", path: `/fr${pathname === "/" ? "" : pathname}` };
  }
  return { kind: "rewrite", path: `/en${pathname}` };
}
