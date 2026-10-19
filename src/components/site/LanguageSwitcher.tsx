"use client";

import { useDictionary } from "@/i18n/dictionary-context";
import { LOCALE_COOKIE, type Locale } from "@/i18n/locales";
import { localizeHref } from "@/i18n/paths";
import { useLocalizedPathname } from "@/i18n/use-localized-pathname";

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
 * Manual language toggle: a single link to the other locale's version of the
 * current page (built with `localizeHref`, the same math `localePaths` uses:
 * the French root is `/fr`, not `/fr/`). Setting the cookie on click (rather than relying on a
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
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  // Both come from the same normalised pathname, never the raw
  // `usePathname()`: on the server that's the proxy's internal `/en/cars`,
  // which naively prefixed gave the broken `/fr/en/cars`.
  const { pathname, locale } = useLocalizedPathname();
  const dict = useDictionary();
  const target = otherLocale(locale);
  const href = localizeHref(pathname, target);
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
