"use client";

import { useEffect } from "react";

/**
 * Last-resort error page. It replaces the root layout, so it renders its own
 * <html> and <body> and cannot use the site's components or styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            Something went wrong
          </p>
          <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>We hit a bump in the road</h1>
          <p style={{ color: "#5b6470", lineHeight: 1.6 }}>
            The site is temporarily unavailable. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 44,
              padding: "0 20px",
              borderRadius: 8,
              border: 0,
              background: "#1769ff",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
