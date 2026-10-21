
import { imageRemotePatterns } from "./src/lib/images-config.mjs";
const isProduction = process.env.NODE_ENV === "production";

// Keep the existing build directory configuration.
const distDir = process.env.NEXT_DIST_DIR || ".next";

if (isProduction && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "\n[config] NEXT_PUBLIC_SITE_URL is not set. Canonical links, the sitemap and " +
      "Open Graph tags will point at the placeholder domain. Set it to the live " +
      "domain before deploying.\n",
  );
}

// Server Actions (e.g. the admin "save vehicle" form) are rejected unless the
// request's Origin matches the Host Next.js sees. Behind a reverse proxy
// that doesn't forward the original Host header as-is (Hostinger's Node.js
// hosting does this), the submit fails with a generic error even though the
// page itself loads fine. Allow-listing the real domain fixes that without
// loosening the check for any other origin.
function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

const allowedOrigins = [siteOrigin()].filter(Boolean);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig = {
  distDir,
  poweredByHeader: false,
  typedRoutes: false,

  images: {
    remotePatterns: imageRemotePatterns(),

    ...(process.env.E2E_ALLOW_LOCAL_IMAGES === "1"
      ? { dangerouslyAllowLocalIP: true }
      : {}),

    qualities: [
      40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100,
    ],

    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  experimental: {
    globalNotFound: true,
    ...(allowedOrigins.length
      ? { serverActions: { allowedOrigins } }
      : {}),
  },
};

export default nextConfig;
