import { Star } from "lucide-react";

export function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < rounded ? "fill-accent text-accent" : "fill-line text-line"
          }
          aria-hidden
        />
      ))}
    </span>
  );
}
