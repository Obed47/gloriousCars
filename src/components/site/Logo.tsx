import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Shared Glorious Cars brand lockup. `preload` only for the copy in the
 * navbar, which is always visible; the footer copy loads lazily.
 */
export function Logo({
  tone = "dark",
  className = "",
  preload = false,
}: {
  tone?: "dark" | "light";
  className?: string;
  preload?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={`group inline-flex items-center ${className}`}
    >
      <span className="relative block h-12 w-36 sm:h-14 sm:w-40">
        <Image
          src={tone === "light" ? "/logoWhite.png" : "/logo.png"}
          alt={SITE.name}
          fill
          preload={preload}
          sizes="(max-width: 640px) 10rem, 11rem"
          className="object-contain object-center"
        />
      </span>
    </Link>
  );
}
