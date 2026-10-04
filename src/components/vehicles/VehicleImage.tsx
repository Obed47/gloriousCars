"use client";

import Image from "next/image";
import { useState } from "react";
import { CarGlyph } from "@/components/ui/icons";

/**
 * next/image wrapper that always looks intentional:
 *  - shimmer while loading (light on cards, dark on cinematic imagery)
 *  - fade + settle transition on load
 *  - branded car silhouette if the remote image ever fails
 *
 * The parent is `position: relative` and sizes the box; the image fills it.
 * `tone="dark"` keeps the loading state dark so overlaid light text stays
 * readable (e.g. the transparent navbar over the hero). `fit="contain"` shows
 * the whole image, padded, for cut-out (transparent) artwork.
 */
export function VehicleImage({
  src,
  alt,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  tone = "auto",
  className = "",
  rounded = "",
  fit = "cover",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  tone?: "auto" | "dark";
  className?: string;
  rounded?: string;
  fit?: "cover" | "contain";
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-graphite ${rounded} ${className}`}
    >
      {status !== "error" && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          {...(priority ? { preload: true } : {})}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setStatus("loaded");
          }}
          className={`${
            fit === "contain" ? "object-contain p-6 sm:p-10" : "object-cover"
          } transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            status === "loaded"
              ? "scale-100 opacity-100"
              : "scale-[1.04] opacity-0"
          }`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate to-ink">
          <CarGlyph className="h-14 w-28 text-silver/35" />
        </div>
      )}

      {status === "loading" && (
        <div
          className={`absolute inset-0 rounded-none ${
            tone === "dark" ? "skeleton-dark" : "skeleton"
          }`}
          aria-hidden
        />
      )}
    </div>
  );
}
