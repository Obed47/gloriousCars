import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    icons: [{ src: "/icon.svg", sizes: "48x48", type: "image/svg+xml" }],
    background_color: "#0b0d0f",
    theme_color: "#0b0d0f",
    categories: ["shopping", "automotive"],
  };
}
