/**
 * English dictionary. The source of truth for `Dictionary`'s shape — every
 * later content task adds its own top-level namespace here (and to `fr.ts`).
 */
export const en = {
  common: {
    viewSite: "View site",
    loading: "Loading…",
  },
  nav: {
    home: "Home",
    cars: "Cars",
    about: "About",
    services: "Services",
    contact: "Contact",
  },
  languageSwitcher: {
    switchToFrench: "Switch to French",
    switchToEnglish: "Switch to English",
  },
  home: {
    metadata: {
      title: "Cars for Sale in Yaoundé & Douala, Cameroon",
      description:
        "Shop quality cars for sale in Yaoundé, Douala and across Cameroon. Compare inspected vehicles, view transparent prices and book a test drive with Glorious Cars.",
    },
    hero: {
      headlineLine1: "Find the right car,",
      headlineLine2: "ready to drive.",
      description:
        "Browse quality cars for sale in Yaoundé, Douala and across Cameroon, compare your options and find one that fits your life.",
      cta: "Explore Cars",
      imageAlt: "A lineup of trusted vehicles available at Glorious Cars",
    },
    quickSearch: {
      ariaLabel: "Quick vehicle search",
      brandLabel: "Brand",
      anyBrand: "Any brand",
      fuelLabel: "Fuel",
      anyFuel: "Any fuel",
      transmissionLabel: "Transmission",
      anyTransmission: "Any transmission",
      yearFromLabel: "Year from",
      anyYear: "Any year",
      maxPriceLabel: "Max price",
      noMaximum: "No maximum",
      upTo: "Up to",
      searchCars: "Search Cars",
    },
    featuredVehicles: {
      eyebrow: "Featured Vehicles",
      title: "Some of our most sought-after cars",
      description:
        "Hand-picked from current stock. Pick one to see the full gallery, specs and to book a test drive.",
      viewAll: "View all vehicles",
    },
    oilService: {
      eyebrow: "Before key handover",
      title: "Fresh engine & gearbox oil in every car",
      description:
        "Before any car leaves us, we replace its engine and gearbox oil with quality oil of the correct grade. You drive away on fresh oil from day one, with nothing to sort out yourself.",
      imageAlt: "Clean golden engine oil being poured into a car engine",
      matchedTitle: "Matched to your car",
      matchedBody: "Oil chosen to your manufacturer’s specification.",
      points: [
        {
          title: "Quality engine oil",
          body: "Fresh, sealed oil in the grade your engine calls for — synthetic or semi-synthetic.",
        },
        {
          title: "Gearbox oil",
          body: "The right fluid for manual or automatic gearboxes, for smooth, quiet shifting.",
        },
        {
          title: "Changed before delivery",
          body: "Old oil drained and new oil filled to the correct level by our team, before the keys are in your hands.",
        },
      ],
    },
    aboutStrip: {
      imageAlt: "A lineup of quality vehicles available at Glorious Cars",
      eyebrow: "About Glorious Cars",
      title: "More than a car. A better way to move.",
      description:
        "Every vehicle we list is chosen for quality and reliability, inspected properly, and described honestly — the mileage is the mileage and the photos are the actual car. From first search to signed paperwork, a real person is one WhatsApp message away.",
      cta: "Our story",
    },
    whyChooseUs: {
      eyebrow: "Why Choose Us",
      title: "Buying a car should feel this straightforward",
      reasons: [
        {
          title: "Carefully selected vehicles",
          body: "Every car is chosen with quality and reliability in mind, then inspected before it reaches the listing.",
        },
        {
          title: "Transparent information",
          body: "Clear specifications, honest pricing, real mileage and full vehicle details — no fine print surprises.",
        },
        {
          title: "Easy test drives",
          body: "Choose a date, time and location that suit you. Confirmation comes straight to your phone.",
        },
        {
          title: "Direct assistance",
          body: "Talk to our team the moment you have a question — no call queues, no scripts, just answers on WhatsApp.",
        },
        {
          title: "Trusted service",
          body: "Professional support from first search to handover, and after you drive away.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "How It Works",
      title: "Four steps from first look to first drive",
      steps: [
        {
          title: "Discover",
          body: "Browse our collection and filter down to the vehicles that fit your needs.",
        },
        {
          title: "Explore",
          body: "Check the specifications, the full image gallery and pricing.",
        },
        {
          title: "Experience",
          body: "Book a test drive at a date, time and location that suit you.",
        },
        {
          title: "Drive away",
          body: "Talk to our team on WhatsApp, visit us and complete your purchase.",
        },
      ],
    },
    brandStrip: {
      eyebrow: "Explore by Brand",
      title: "Start with a marque you trust",
      vehicleSingular: "vehicle",
      vehiclePlural: "vehicles",
    },
    testimonials: {
      eyebrow: "Customer Reviews",
      title: "Driven by trust",
      description: "A few words from people who found their car with us.",
      regionLabel: "Customer reviews",
      previousLabel: "Previous reviews",
      nextLabel: "Next reviews",
    },
    homeCta: {
      heading: "Your next car is closer than you think.",
      description: "Explore our vehicles or speak directly with our team today.",
      exploreCars: "Explore Cars",
      whatsapp: "Chat on WhatsApp",
    },
  },
};

export type Dictionary = typeof en;
