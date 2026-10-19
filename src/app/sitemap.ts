import type { MetadataRoute } from "next";
import { getAllVehicles } from "@/lib/repository";
import { vehiclePath } from "@/lib/slug";
import { SITE } from "@/lib/site";
import { localePaths } from "@/i18n/alternates";
import { LOCALES } from "@/i18n/locales";

export const revalidate = 300;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

type RouteSpec = {
  /** Unprefixed (English) path, e.g. "/cars". */
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  lastModified?: Date;
};

/**
 * Expands one route spec into its English and French sitemap entries. Both
 * share the same priority/changeFrequency/lastModified, and each carries
 * `alternates.languages` (from `localePaths`) pointing at the other.
 *
 * Unlike page-level `generateMetadata`, `sitemap.ts`'s `alternates.languages`
 * is emitted as-is into `<xhtml:link href="...">`, with no `metadataBase`
 * resolution step — so `localePaths()`'s relative paths must be made
 * absolute here before they're used.
 */
function bilingualEntries(spec: RouteSpec): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => {
    const { canonical, languages } = localePaths(spec.path, locale);
    const absoluteLanguages = Object.fromEntries(
      Object.entries(languages).map(([hreflang, path]) => [hreflang, `${SITE.url}${path}`]),
    ) as typeof languages;
    return {
      url: `${SITE.url}${canonical}`,
      priority: spec.priority,
      changeFrequency: spec.changeFrequency,
      ...(spec.lastModified ? { lastModified: spec.lastModified } : {}),
      alternates: { languages: absoluteLanguages },
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles();
  const staticRouteSpecs: RouteSpec[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/cars", priority: 0.9, changeFrequency: "daily" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/services", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  // The public query already hides sold cars; filter again so that stays true
  // even if the database rules change.
  const vehicleRouteSpecs: RouteSpec[] = vehicles
    .filter((v) => v.status !== "Sold")
    .map((v) => ({
      path: vehiclePath(v),
      lastModified: new Date(v.listedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticRouteSpecs, ...vehicleRouteSpecs].flatMap(bilingualEntries);
}
