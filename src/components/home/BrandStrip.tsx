import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { BrandSummary } from "@/lib/repository";

export function BrandStrip({ brands }: { brands: BrandSummary[] }) {
  return (
    <section className="section-y bg-surface">
      <div className="wrap">
        <SectionHeading
          eyebrow="Explore by Brand"
          title="Start with a marque you trust"
        />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand, i) => (
            <Reveal key={brand.slug} delay={(i % 6) * 0.05} y={14}>
              <Link
                href={`/cars?brand=${encodeURIComponent(brand.name)}`}
                className="group flex h-24 flex-col items-center justify-center gap-1 rounded-xl px-3 text-center border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-card"
              >
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted sm:text-sm sm:tracking-[0.12em] transition-colors group-hover:text-ink">
                  {brand.name}
                </span>
                <span className="text-[0.6875rem] text-silver">
                  {brand.count} {brand.count === 1 ? "vehicle" : "vehicles"}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
