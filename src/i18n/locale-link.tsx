"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizeHref } from "./paths";
import { useLocale } from "./use-localized-pathname";

/**
 * `next/link` for internal pages: takes the unprefixed (English) path, e.g.
 * `/cars?brand=BMW`, and points it at the current locale's version
 * (`/fr/cars?brand=BMW` on a French page), so French pages link to French
 * pages without a cookie-driven redirect hop — and crawlers, which carry no
 * cookie, see the French site link to itself. Non-path hrefs (`#main`,
 * `mailto:`, external URLs) pass through untouched.
 */
export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  return (
    <Link
      href={typeof href === "string" ? localizeHref(href, locale) : href}
      {...props}
    />
  );
}
