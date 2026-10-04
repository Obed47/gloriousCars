import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { SITE } from "@/lib/site";
import { getVehicleSummaries } from "@/lib/repository";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CompareTray } from "@/components/site/CompareTray";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";

// Self-hosted Montserrat (variable). Source: @fontsource-variable/montserrat.
// The latin subset covers Latin-1 (é, è, ç, ã…) used across the content.
const montserrat = localFont({
  src: "../fonts/montserrat-variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-montserrat",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  authors: [{ name: SITE.legalName }],
  keywords: [
    "cars for sale",
    "cars for sale in Yaoundé",
    "used cars in Yaoundé",
    "car dealers in Cameroon",
    "cars for sale in Cameroon",
    "used cars",
    "car dealership",
    "buy a car",
    "test drive",
    SITE.address.city,
    SITE.address.country,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Catalogue pages are prerendered from Supabase. Admin edits refresh them on
// demand (revalidatePath); this window is the fallback for rows changed
// directly in the Supabase dashboard.
export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#0b0d0f",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const summaries = await getVehicleSummaries();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} h-full`}
    >
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before
          hydration; this only silences attribute mismatches on <body> itself. */}
      <body
        className="flex min-h-dvh flex-col bg-mist font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <SiteJsonLd />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp />
          <CompareTray summaries={summaries} />
        </Providers>
      </body>
    </html>
  );
}
