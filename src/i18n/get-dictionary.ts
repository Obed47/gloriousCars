import { lang } from "next/root-params";
import { dictionaries, type Dictionary } from "./dictionaries";
import { DEFAULT_LOCALE, isLocale } from "./locales";

// Files that import from `next/root-params` don't need `import "server-only"`
// — that import already fails at build time inside a Client Component.


/**
 * Server-only. Resolves the dictionary for the current route's `lang` root
 * param, falling back to `DEFAULT_LOCALE` if it's missing or unsupported.
 */
export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang();
  return dictionaries[isLocale(locale) ? locale : DEFAULT_LOCALE];
}
