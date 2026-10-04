import { CarGlyph } from "./icons";

/**
 * Automotive loading indicator — a car tracking left-to-right along a
 * dashed road. Pure CSS animation (see globals.css), respects
 * prefers-reduced-motion via the global reset.
 */
export function CarLoader({
  label = "Loading vehicles",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-56 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-1 h-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-line-strong) 0 14px, transparent 14px 28px)",
            backgroundSize: "28px 1px",
            animation: "road-dash 0.6s linear infinite",
          }}
          aria-hidden
        />
        <CarGlyph
          className="absolute bottom-0 left-0 h-8 w-16 text-ink"
          style={{ animation: "drive-across 1.9s cubic-bezier(0.45,0,0.55,1) infinite" }}
        />
      </div>
      <span className="eyebrow text-muted">{label}</span>
    </div>
  );
}
