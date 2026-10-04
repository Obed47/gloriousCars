import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`flex flex-col gap-4 ${
        isCenter ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Tag
        className={`max-w-3xl text-3xl font-bold sm:text-4xl lg:text-[2.75rem] ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={`max-w-2xl text-base leading-relaxed sm:text-lg ${
            tone === "light" ? "text-silver" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
