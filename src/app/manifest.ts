import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
    background_color: "#0b0d0f",
    theme_color: "#0b0d0f",
    categories: ["shopping", "automotive"],
  };
}
