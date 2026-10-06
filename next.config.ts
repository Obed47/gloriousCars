import type { NextConfig } from "next";
import { imageRemotePatterns } from "./src/lib/images";

const isProduction = process.env.NODE_ENV === "production";

// Set when the production build must not reuse `.next`, such as the end-to-end
// test build, so it does not disturb a running `next dev`.
const distDir = process.env.NEXT_DIST_DIR || ".next";

if (isProduction && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "\n[config] NEXT_PUBLIC_SITE_URL is not set. Canonical links, the sitemap and " +
      "Open Graph tags will point at the placeholder domain. Set it to the live " +
      "domain before deploying.\n",
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  distDir,
  poweredByHeader: false,
  // Dynamic hrefs (vehiclePath(), brand filters, …) are plain strings.
  typedRoutes: false,
  images: {
    // Allowed photo hosts live in src/lib/images.ts so the admin form can
    // validate against exactly the same list: this project's Supabase
    // Storage bucket (admin uploads).
    remotePatterns: imageRemotePatterns(),
    // Only the end-to-end test build fetches photos from a fake backend on
    // localhost. Off everywhere else, so production keeps Next's SSRF protection.
    ...(process.env.E2E_ALLOW_LOCAL_IMAGES === "1" ? { dangerouslyAllowLocalIP: true } : {}),
    qualities: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
