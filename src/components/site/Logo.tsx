import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

/** Shared Glorious Cars brand lockup. */
export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={`group inline-flex items-center ${className}`}
    >
      <span className="relative block h-12 w-36 overflow-hidden sm:h-14 sm:w-40">
        <Image
          src={tone === "light" ? "/logoWhite.png" : "/logo.png"}
          alt={SITE.name}
          fill
          priority
          sizes="(max-width: 640px) 10rem, 11rem"
          className="object-cover object-center"
        />
      </span>
    </Link>
  );
}
