import type { Locale } from "./locales";
import { localizeHref } from "./paths";

/**
 * SEO alternates (canonical + hreflang) for a page, derived from its
 * unprefixed (English) path. Every French route is the same path prefixed
 * with `/fr`; the root path `/` becomes `/fr`, not `/fr/`.
 */
export function localePaths(
  unprefixedPath: string,
  locale: Locale,
): {
  canonical: string;
  languages: { en: string; fr: string; "x-default": string };
} {
  const frenchPath = localizeHref(unprefixedPath, "fr");

  return {
    canonical: locale === "fr" ? frenchPath : unprefixedPath,
    languages: {
      en: unprefixedPath,
      fr: frenchPath,
      "x-default": unprefixedPath,
    },
  };
}
