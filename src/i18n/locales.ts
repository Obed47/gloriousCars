/** Supported site locales, in display/priority order. */
export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

/** Locale used when detection fails or resolves to something unsupported. */
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers the visitor's chosen locale across requests. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
