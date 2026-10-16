import { SITE } from "@/lib/site";

/** Organization and website graph used by search engines to understand the business. */
export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AutoDealer", "Organization"],
        "@id": `${SITE.url}#dealer`,
        name: SITE.legalName,
        url: SITE.url,
        logo: `${SITE.url}/logo.png`,
        image: `${SITE.url}/logo.png`,
        description: SITE.description,
        telephone: SITE.phoneDisplay,
        email: SITE.email,
        priceRange: "$$",
        currenciesAccepted: SITE.defaultCurrency,
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.line,
          addressLocality: SITE.address.city,
          addressCountry: SITE.address.country,
        },
        areaServed: SITE.serviceAreas.map((name) => ({
          "@type": "AdministrativeArea",
          name,
        })),
        // One `department` per showroom/pickup location, so the branches in
        // both cities (not just the registered address) carry their own
        // locality signal for local search.
        department: SITE.locations.map((loc) => {
          const [city, branch] = loc.split(" — ");
          return {
            "@type": "AutoDealer",
            name: `${SITE.legalName} — ${branch}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: city,
              addressCountry: SITE.address.country,
            },
          };
        }),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: SITE.phoneDisplay,
          contactType: "sales",
          areaServed: "CM",
          availableLanguage: ["English", "French"],
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "09:00",
            closes: "16:00",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}#dealer` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.url}/cars?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
