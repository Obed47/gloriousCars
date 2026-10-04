import type { NextConfig } from "next";
import { imageRemotePatterns } from "./src/lib/images";

const nextConfig: NextConfig = {
  // Dynamic hrefs (vehiclePath(), brand filters, …) are plain strings.
  typedRoutes: false,
  images: {
    // Allowed photo hosts live in src/lib/images.ts so the admin form can
    // validate against exactly the same list: this project's Supabase
    // Storage bucket (admin uploads).
    remotePatterns: imageRemotePatterns(),
    qualities: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
