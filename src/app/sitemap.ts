import type { MetadataRoute } from "next";
import { getAllVehicles } from "@/lib/repository";
import { vehiclePath } from "@/lib/slug";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, priority: 1, changeFrequency: "daily" },
    { url: `${SITE.url}/cars`, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE.url}/about`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE.url}/services`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE.url}/contact`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE.url}/privacy`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${SITE.url}/terms`, priority: 0.2, changeFrequency: "yearly" },
  ];

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${SITE.url}${vehiclePath(v)}`,
    lastModified: new Date(v.listedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
