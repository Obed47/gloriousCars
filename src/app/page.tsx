import { Hero } from "@/components/home/Hero";
import { QuickSearch } from "@/components/home/QuickSearch";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { OilService } from "@/components/home/OilService";
import { AboutStrip } from "@/components/home/AboutStrip";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BrandStrip } from "@/components/home/BrandStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { HomeCta } from "@/components/home/HomeCta";
import {
  getBrandsWithCounts,
  getFeaturedVehicles,
  getFilterOptions,
  getReviews,
} from "@/lib/repository";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cars for Sale in Yaoundé and Cameroon",
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${SITE.name} | Cars for Sale in Yaoundé and Cameroon`,
    description: SITE.description,
    url: "/",
  },
};

export default async function HomePage() {
  const [featured, options, brands, reviews] = await Promise.all([
    getFeaturedVehicles(6),
    getFilterOptions(),
    getBrandsWithCounts(),
    getReviews(),
  ]);

  return (
    <>
      <Hero />

      <div className="wrap relative z-20">
        <QuickSearch options={options} />
      </div>

      <FeaturedVehicles vehicles={featured} />
      <OilService />
      <AboutStrip />
      <WhyChooseUs />
      <HowItWorks />
      <BrandStrip brands={brands} />
      <Testimonials reviews={reviews} />
      <HomeCta />
    </>
  );
}
