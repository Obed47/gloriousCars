"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/data/reviews";

export function Testimonials({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="section-y">
      <div className="wrap">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Customer Reviews"
            title="Driven by trust"
            description="A few words from people who found their car with us."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous reviews"
              className="flex size-11 items-center justify-center rounded-lg border border-line-strong bg-surface text-ink transition-colors hover:border-ink hover:bg-mist"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next reviews"
              className="flex size-11 items-center justify-center rounded-lg border border-line-strong bg-surface text-ink transition-colors hover:border-ink hover:bg-mist"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          tabIndex={0}
          aria-label="Customer reviews"
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {reviews.map((review) => (
            <figure
              key={review.id}
              data-card
              className="card flex w-[85%] shrink-0 snap-start flex-col gap-4 p-6 sm:w-[380px]"
            >
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <Quote className="size-6 text-accent-soft" aria-hidden />
              </div>
              <blockquote className="flex-1 text-[0.9375rem] leading-relaxed text-ink">
                “{review.quote}”
              </blockquote>
              <figcaption className="border-t border-line pt-4">
                <p className="text-sm font-bold text-ink">{review.name}</p>
                <p className="text-xs text-muted">
                  {review.location} · {review.vehicle}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
