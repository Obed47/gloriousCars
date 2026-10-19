"use client";

import { usePathname } from "next/navigation";
import { useDictionary } from "@/i18n/dictionary-context";
import { LOCALE_COOKIE, type Locale } from "@/i18n/locales";

/** Each locale's name for itself, shown on the link that switches to it. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** Short form shown instead, in `compact` mode, below the `sm` breakpoint. */
const LANGUAGE_CODES: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
};

function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "fr" : "en";
}

/**
 * The current pathname rewritten for the other locale — strips the `/fr`
 * prefix to go to English, prepends it to go to French. Mirrors the math in
 * `localePaths` (src/i18n/alternates.ts): the French root is `/fr`, not `/fr/`.
 */
function otherLocalePath(pathname: string, locale: Locale): string {
  if (locale === "fr") {
    return pathname.slice("/fr".length) || "/";
  }
  return pathname === "/" ? "/fr" : `/fr${pathname}`;
}

/**
 * Manual language toggle: a single link to the other locale's version of the
 * current page. Setting the cookie on click (rather than relying on a
 * client-side transition) guarantees it's in place before `proxy` sees the
 * next request, so a full navigation — not Next's router — follows it.
 *
 * `compact`: below the `sm` breakpoint, show a two-letter code ("FR"/"EN")
 * instead of the full name. The Navbar instance sits in an always-visible,
 * icon-width row alongside the mobile menu button; at phone width, the full
 * word ("Français"/"English") made that row wider than the viewport, pushing
 * the menu button off-screen (confirmed via a real 375px-viewport layout
 * trace — tests/e2e/smoke.spec.ts's "no public page scrolls sideways"
 * check). The Footer's instance sits in its own block-level row with room to
 * spare, so it keeps the full name at every width (the default, unchanged).
 * Each span is excluded from the accessible name computation while its
 * breakpoint's `display: none` applies, so the link's accessible name is
 * still exactly one of "FR"/"EN" or "Français"/"English" at any given width
 * — never both at once.
 */
export function LanguageSwitcher({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const dict = useDictionary();
  const target = otherLocale(locale);
  const href = otherLocalePath(pathname, locale);
  const title =
    target === "fr"
      ? dict.languageSwitcher.switchToFrench
      : dict.languageSwitcher.switchToEnglish;

  return (
    <a
      href={href}
      title={title}
      className="rounded-md px-2 py-1 text-sm font-medium transition-colors"
      onClick={(event) => {
        event.preventDefault();
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000`;
        window.location.href = href;
      }}
    >
      {compact ? (
        <>
          <span className="sm:hidden">{LANGUAGE_CODES[target]}</span>
          <span className="hidden sm:inline">{LANGUAGE_NAMES[target]}</span>
        </>
      ) : (
        LANGUAGE_NAMES[target]
      )}
    </a>
  );
}
