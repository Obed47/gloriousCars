import type { Metadata } from "next";
import Link from "next/link";

/**
 * Global 404 for URLs that match no route at all — not even the `[lang]`
 * segment, so `src/app/[lang]/not-found.tsx`'s boundary never resolves (see
 * node_modules/next/dist/docs/.../file-conventions/not-found.md: a root
 * layout on a top-level dynamic segment "makes composing a consistent 404
 * page harder"). Like global-error.tsx, this file bypasses every layout, so
 * it renders its own <html>/<body> and cannot use the site's components,
 * dictionary or Tailwind styles — it's locale-agnostic by construction, the
 * same way global-error.tsx is.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist or may have been moved.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#f5f7fa",
          color: "#0b0d0f",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: 420 }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#1769ff", fontWeight: 700 }}>
            Error 404
          </p>
          <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>This page took a wrong turn</h1>
          <p style={{ color: "#5b6470", lineHeight: 1.6 }}>
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Let&apos;s get you back on the road.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              height: 44,
              padding: "0 20px",
              borderRadius: 8,
              background: "#1769ff",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
