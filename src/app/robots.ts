import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /fr/admin and /fr/login are not listed: the proxy redirects them to English.
      disallow: ["/favorites", "/compare", "/fr/favorites", "/fr/compare", "/admin", "/login"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
