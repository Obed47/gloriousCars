import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";

import { SITE } from "@/lib/site";
import { getVehicleSummaries } from "@/lib/repository";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CompareTray } from "@/components/site/CompareTray";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { isLocale } from "@/i18n/locales";


// Self-hosted Montserrat (variable). Source: @fontsource-variable/montserrat.
// The latin subset covers Latin-1 (é, è, ç, ã…) used across the content.
const montserrat = localFont({
  src: "../../fonts/montserrat-variable.woff2",
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
    "cars for sale in Douala",
    "used cars in Yaoundé",
    "used cars in Douala",
    "car dealers in Yaoundé",
    "car dealers in Douala",
    "car dealers in Cameroon",
    "cars for sale in Cameroon",
    "used cars",
    "car dealership",
    "buy a car",
    "test drive",
    SITE.address.city,
    "Douala",
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
  // Legacy geo meta tags. Google ignores these, but Bing and some regional
  // engines still read them as a light signal for the target market.
  other: {
    "geo.region": "CM",
    "geo.placename": "Yaoundé, Douala",
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

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // `[lang]` is the top-level segment, so any first path segment the proxy
  // doesn't touch lands here — its matcher skips anything that looks like a
  // static file, which made `/apple-touch-icon.png` or `/wp-config.txt` render
  // the home page as a cached 200. Only real locales get a site; everything
  // else 404s (via global-not-found.tsx). Scoped to this segment on purpose:
  // `dynamicParams = false` would be inherited by the vehicle detail route,
  // whose newly listed cars must render without a rebuild.
  if (!isLocale(lang)) notFound();
  const locale = lang;
  const summaries = await getVehicleSummaries();
  const dictionary = await getDictionary();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} h-full`}
    >
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before
          hydration; this only silences attribute mismatches on <body> itself. */}
      <body
        className="flex min-h-dvh flex-col bg-mist font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        <Providers knownIds={summaries.map((s) => s.id)}>
          <DictionaryProvider dictionary={dictionary}>
            <SiteJsonLd locale={locale} />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              {dictionary.common.skipToContent}
            </a>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
            <CompareTray summaries={summaries} />
          </DictionaryProvider>
        </Providers>
      </body>
    </html>
  );
}
