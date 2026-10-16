"use client";

import { usePathname } from "next/navigation";
import { useDictionary } from "@/i18n/dictionary-context";
import { LOCALE_COOKIE, type Locale } from "@/i18n/locales";

/** Each locale's name for itself, shown on the link that switches to it. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
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
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
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
      {LANGUAGE_NAMES[target]}
    </a>
  );
}
