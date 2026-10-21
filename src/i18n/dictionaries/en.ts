/**
 * English dictionary. The source of truth for `Dictionary`'s shape — every
 * later content task adds its own top-level namespace here (and to `fr.ts`).
 */
export const en = {
  common: {
    viewSite: "View site",
    loading: "Loading…",
    skipToContent: "Skip to content",
    /** `{rating}` is replaced with the star rating, e.g. "Rated 5 out of 5". */
    ratedOutOf: "Rated {rating} out of 5",
  },
  nav: {
    home: "Home",
    cars: "Cars",
    about: "About",
    services: "Services",
    contact: "Contact",
    findCar: "Find a Car",
    favorites: "Favorites",
    openMenu: "Open menu",
    searchVehicles: "Search vehicles",
    searchTerm: "Search term",
    searchPlaceholder: "Search make or car name…",
    closeSearch: "Close search",
    popular: "Popular",
    primaryLabel: "Primary",
    menu: "Menu",
    closeMenu: "Close menu",
    popularSearches: {
      hybrid: "Hybrid",
      electric: "Electric",
      automatic: "Automatic",
      underPrice: "Under XAF 40M",
    },
  },
  footer: {
    navigationHeading: "Navigation",
    navigationLabel: "Footer navigation",
    servicesHeading: "Services",
    contactHeading: "Contact",
    services: {
      sales: "Vehicle Sales",
      testDrives: "Test Drives",
      consultation: "Vehicle Consultation",
      assistance: "Financing & Assistance",
    },
    chatOnWhatsapp: "Chat on WhatsApp",
    addressLine: "Biyem-Assi Branch",
    country: "Cameroon",
    /** Labels for `SITE.hours`, keyed by each entry's `key`. */
    hours: {
      weekdays: "Monday – Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    byAppointment: "By appointment",
    rightsReserved: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
    staffLogin: "Staff",
  },
  /** Labels for `SITE.stats`, keyed by each entry's `key`. */
  stats: {
    vehiclesInStock: "Vehicles in stock",
    happyClients: "Happy clients",
    yearsOnTheRoad: "Years on the road",
    whatsappAssistance: "WhatsApp assistance",
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
  cars: {
    metadata: {
      title: "Cars for Sale in Yaoundé & Douala, Cameroon",
      descriptionPrefix:
        "Browse cars for sale in Yaoundé, Douala and across Cameroon at",
      descriptionSuffix:
        "Filter by brand, price, body type, fuel and more, then book a test drive.",
      ogDescription:
        "Browse inspected cars for sale in Yaoundé, Douala and across Cameroon.",
    },
    heading: {
      eyebrow: "Inventory",
      title: "Cars for sale in Yaoundé & Douala",
      description:
        "Compare inspected vehicles available in Yaoundé, Douala and across Cameroon, with transparent prices and direct WhatsApp support.",
    },
    filterPanel: {
      title: "Filters",
      resetAll: "Reset all",
      brand: "Brand",
      price: "Price",
      year: "Year",
      maxMileage: "Max mileage",
      fuel: "Fuel",
      transmission: "Transmission",
      colour: "Colour",
      min: "Min",
      max: "Max",
      from: "From",
      to: "To",
      upTo: "Up to",
      any: "Any",
      anyMileage: "Any mileage",
    },
    sort: {
      label: "Sort",
      ariaLabel: "Sort vehicles",
    },
    sortOptions: {
      featured: "Featured",
      newest: "Newest",
      "price-asc": "Price: Low to High",
      "price-desc": "Price: High to Low",
      "mileage-asc": "Lowest Mileage",
    },
    toolbar: {
      filterButton: "Filter",
      clearAll: "Clear all",
      countAvailableSingular: "{count} vehicle available",
      countAvailablePlural: "{count} vehicles available",
      countOfTotalSingular: "{shown} of {total} vehicle",
      countOfTotalPlural: "{shown} of {total} vehicles",
    },
    emptyState: {
      title: "No vehicles match your search",
      description: "Try widening your price range or removing a filter.",
      resetButton: "Reset filters",
    },
    mobileSheet: {
      ariaLabel: "Filter and sort",
      heading: "Filter & Sort",
      closeFiltersAriaLabel: "Close filters",
      sortByLabel: "Sort by",
      resetButton: "Reset",
      showResults: "Show {count} results",
    },
  },
  vehicleCard: {
    featuredBadge: "Featured",
    viewDetails: "View details",
    view: "View",
    seatsUnit: "seats",
    saveToFavoritesPrefix: "Save",
    toFavoritesSuffix: "to favorites",
    removeFromFavoritesPrefix: "Remove",
    fromFavoritesSuffix: "from favorites",
    addToComparisonPrefix: "Add",
    toComparisonSuffix: "to comparison",
    removeFromComparisonPrefix: "Remove",
    fromComparisonSuffix: "from comparison",
    compare: "Compare",
    comparisonFull: "Comparison is full (max 3)",
  },
  vehicleDetail: {
    breadcrumb: {
      ariaLabel: "Breadcrumb",
      carsForSale: "Cars for sale",
    },
    summary: {
      mileageLabel: "Mileage",
      fuelLabel: "Fuel",
      gearboxLabel: "Gearbox",
      availableInPrefix: "Available in",
      referencePrefix: "Reference",
      listedForSaleByPrefix: "Listed for sale by",
    },
    specs: {
      year: "Year",
      mileage: "Mileage",
      fuel: "Fuel",
      transmission: "Transmission",
      seats: "Seats",
    },
    headings: {
      specsEyebrow: "At a glance",
      specsTitle: "Key specifications",
      aboutEyebrow: "Overview",
      aboutTitle: "About this vehicle",
      relatedEyebrow: "You might also like",
      relatedTitle: "Similar vehicles",
    },
    cta: {
      inquireWhatsApp: "Order / Inquire on WhatsApp",
      inquireSimilar: "Ask about similar cars",
      bookTestDrive: "Book a Test Drive",
      testDriveShort: "Test Drive",
    },
    about: {
      readMore: "Read more",
      readLess: "Read less",
    },
    saveRow: {
      save: "Save",
      saved: "Saved",
      comparing: "Comparing",
    },
    gallery: {
      openFullscreen: "Open full-screen gallery",
      closeGallery: "Close gallery",
      previousImage: "Previous image",
      nextImage: "Next image",
      viewPrefix: "View",
      gallerySuffix: "gallery",
    },
    metadata: {
      forSaleSuffix: "for sale",
      exploreVehiclePrefix: "Explore the",
      descriptionSuffix:
        "Full specifications, images and test-drive availability at",
    },
  },
  statusBadge: {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
  },
  whatsapp: {
    vehicleInquiry: {
      greeting: "Hello {name}, I'm interested in this vehicle:",
      vehicleLabel: "Vehicle",
      referenceLabel: "Reference",
      yearLabel: "Year",
      priceLabel: "Price",
      mileageLabel: "Mileage",
      fuelLabel: "Fuel",
      transmissionLabel: "Transmission",
      locationLabel: "Location",
      closing:
        "I'd like to know more and how I can proceed with the purchase.",
    },
    testDrive: {
      greeting: "Hello {name}, I'd like to book a test drive.",
      vehicleLabel: "Vehicle",
      refLabel: "Ref",
      nameLabel: "Name",
      phoneLabel: "Phone",
      emailLabel: "Email",
      preferredDateLabel: "Preferred date",
      preferredTimeLabel: "Preferred time",
      preferredLocationLabel: "Preferred location",
      noteLabel: "Note",
    },
    generalInquiry:
      "Hello {name}, I'd like more information about your vehicles.",
  },
  about: {
    metadata: {
      title: "About us",
      descriptionSuffix:
        "is a trusted vehicle marketplace for quality cars for sale in Yaoundé, Douala and across Cameroon, built on transparency and direct service.",
    },
    hero: {
      eyebrow: "About Glorious Cars",
      title: "More than a car. A better way to move.",
      description:
        "We started Glorious Cars because buying a used car should not require a leap of faith. Every vehicle we list is chosen for quality, inspected properly and described honestly  and a real person is always one message away.",
      imageAlt: "A lineup of quality vehicles available at Glorious Cars",
      statsDisclaimer: "Figures shown are placeholders for this demo.",
    },
    approach: {
      eyebrow: "Our approach",
      title: "Quality first, then everything else",
      paragraphs: [
        "Sourcing is deliberate. We buy vehicles with clean histories and verifiable service records, then put each one through a multi-point inspection before it is photographed and listed. If a car does not meet the standard, it does not go on the site.",
        "Information is complete. The mileage on the listing is the mileage on the odometer. The photos are the actual car, not a stock image. Key specifications and known imperfections are documented so you can make a decision before you visit. For any other detail, ask us on WhatsApp.",
        "Service is direct. From the first question to the handover of keys, you deal with our team over WhatsApp and in person no call centres, no scripts, and no pressure to decide on the spot.",
      ],
    },
  },
  services: {
    metadata: {
      title: "Services",
      descriptionPrefix:
        "Vehicle sales, test drives, consultation and buying assistance from",
      descriptionSuffix:
        ", with fresh engine and gearbox oil in every car we deliver.",
    },
    hero: {
      eyebrow: "Services",
      title: "Everything around the car, handled",
      description:
        "From first search to signed paperwork, these are the ways we help you move.",
    },
    items: {
      sales: {
        title: "Vehicle Sales",
        body: "A curated, inspected inventory across brands and budgets. Browse online, filter to what fits, and reserve the car you want.",
        ctaLabel: "Browse inventory",
      },
      testDrives: {
        title: "Test Drives",
        body: "Book a test drive at a date, time and location that work for you. We can bring the vehicle to a location near you where possible.",
        ctaLabel: "See available cars",
      },
      consultation: {
        title: "Vehicle Consultation",
        body: "Not sure which car suits your needs? Tell us your budget, usage and priorities and we will shortlist options — honestly, including ones we do not have in stock.",
        ctaLabel: "Ask our team",
      },
      assistance: {
        title: "Financing & Assistance",
        body: "Guidance through paperwork, transfer, insurance introductions and financing partners. We keep the process moving so you can drive away sooner.",
        ctaLabel: "Talk about options",
      },
      oilService: {
        title: "Engine & Gearbox Oil",
        body: "Every car we deliver gets fresh, quality engine and gearbox oil, matched to the manufacturer's specification and changed by our team before handover.",
      },
    },
    cta: {
      heading: "Have a question about any of this?",
      whatsappButton: "Message us on WhatsApp",
      contactButton: "Contact page",
    },
  },
  contact: {
    metadata: {
      title: "Contact",
      descriptionPrefix: "Contact",
      descriptionMiddle:
        "about cars for sale in Yaoundé, Douala and across Cameroon — WhatsApp, phone, email or visit our showroom in",
      descriptionSuffix: ".",
    },
    hero: {
      eyebrow: "Contact",
      title: "Talk to our team",
      description:
        "The fastest way to reach us is WhatsApp — most messages get a reply within the hour during opening times.",
    },
    whatsappCard: {
      title: "WhatsApp",
      subtitle: "Chat with us now — fastest response",
    },
    cards: {
      phone: "Phone",
      email: "Email",
      showroom: "Showroom",
    },
    openingHours: {
      title: "Opening hours",
    },
    form: {
      nameLabel: "Name",
      phoneLabel: "Phone",
      emailLabel: "Email",
      subjectLabel: "Subject",
      messageLabel: "Message",
      subjects: [
        "General enquiry",
        "Buying a vehicle",
        "Booking a test drive",
        "Selling my car",
        "Something else",
      ],
      messageGreeting: "Hello {name},",
      submitButton: "Send via WhatsApp",
      disclaimer:
        "This opens WhatsApp with your message pre-filled — nothing is sent until you press send there.",
      successEyebrow: "Message ready",
      successHeading: "We've opened WhatsApp for you",
      successBodyPrefix:
        "Send the pre-filled message and our team will reply shortly. Prefer email? Write to",
      successBodySuffix: ".",
      editMessageButton: "Edit message",
    },
  },
  testDrive: {
    title: "Book your test drive",
    description: "Experience the vehicle before you make your decision.",
    confirmedTitle: "Your test drive is requested",
    confirmedDescription:
      "Your details have been opened in WhatsApp. Our team will contact you shortly to confirm your appointment.",
    closeAriaLabel: "Close",
    refLabel: "Ref",
    fields: {
      fullName: "Full name",
      phoneNumber: "Phone number",
      email: "Email",
      preferredDate: "Preferred date",
      preferredTime: "Preferred time",
      preferredLocation: "Preferred location",
      additionalMessage: "Additional message",
    },
    messagePlaceholder: "Anything we should know before your visit?",
    submitButton: "Confirm Test Drive",
    errors: {
      nameRequired: "Please enter your name.",
      phoneRequired: "We need a phone number to confirm.",
      emailInvalid: "That email doesn't look right.",
      dateRequired: "Choose a preferred date.",
      dateInPast: "Choose a date from today onwards.",
      timeRequired: "Pick a time slot.",
    },
    confirmation: {
      vehicleLabel: "Vehicle",
      dateLabel: "Date",
      timeLabel: "Time",
      locationLabel: "Location",
      reopenButton: "Open WhatsApp again",
      doneButton: "Done",
    },
  },
  privacy: {
    metadata: {
      title: "Privacy Policy",
      description: "How {name} handles your information.",
    },
    title: "Privacy Policy",
    disclaimer:
      "This is placeholder text for the demo. Replace it with a policy reviewed by your legal advisor before going live.",
    sections: [
      {
        heading: "Information we collect",
        body: "When you book a test drive or send an enquiry, we collect the details you provide — such as your name, phone number and email — so that we can respond and arrange your appointment. Favorites and comparison selections are stored only in your browser.",
      },
      {
        heading: "How we use it",
        body: "We use your information solely to answer your enquiry, arrange test drives, and complete a purchase if you choose to proceed. We do not sell your data.",
      },
      {
        heading: "WhatsApp",
        body: "Messages you send us via WhatsApp are subject to WhatsApp's own privacy terms in addition to ours.",
      },
    ],
    contact: {
      heading: "Contact",
      prefix: "Questions about your data? Email",
      suffix: ".",
    },
  },
  terms: {
    metadata: {
      title: "Terms & Conditions",
      description: "Terms for using the {name} website.",
    },
    title: "Terms & Conditions",
    disclaimer:
      "This is placeholder text for the demo. Replace it with terms reviewed by your legal advisor before going live.",
    sections: [
      {
        heading: "Vehicle information",
        body: "We take care to describe every vehicle accurately, including mileage, specification and condition. Listings are not a contractual offer; availability and price are confirmed at the point of sale.",
      },
      {
        heading: "Test drives",
        body: "Test drive requests are subject to confirmation by our team and to presenting a valid driving licence. Requested times are preferences, not guaranteed bookings.",
      },
      {
        heading: "No online payment",
        body: "This website does not process payments. Any purchase is completed directly with {legalName}.",
      },
      {
        heading: "Liability",
        body: "The website is provided “as is”. To the extent permitted by law, {legalName} is not liable for indirect or consequential loss arising from use of the site.",
      },
    ],
  },
  favorites: {
    metadata: {
      title: "My Favorites",
      description: "Vehicles you've saved.",
    },
    heading: {
      eyebrow: "Saved for later",
      title: "My favorites",
      description:
        "Your shortlist, kept on this device. Come back any time to pick up where you left off.",
    },
    view: {
      emptyState: {
        title: "No saved vehicles yet",
        description:
          "Tap the heart on any vehicle to keep it here. Favorites are stored on this device.",
      },
      browseAllCars: "Browse all cars",
      savedCountSingular: "{count} saved vehicle",
      savedCountPlural: "{count} saved vehicles",
      clearAll: "Clear all",
    },
  },
  compare: {
    metadata: {
      title: "Compare vehicles",
      description: "Compare up to three vehicles side by side.",
    },
    heading: {
      eyebrow: "Side by side",
      title: "Compare vehicles",
      description:
        "Line up the numbers that matter — price, mileage, power and more — and see the differences at a glance.",
    },
    tray: {
      ariaLabel: "Vehicle comparison tray",
      selectedCount: "{count} of {max} selected",
      clearAll: "Clear all",
      clear: "Clear",
      removeFromComparisonPrefix: "Remove",
      removeFromComparisonSuffix: "from comparison",
      compareLink: "Compare",
    },
    view: {
      emptyState: {
        title: "Nothing to compare yet",
        description:
          "Add up to {max} vehicles using the compare button on any card, then see them side by side here.",
      },
      browseAllCars: "Browse all cars",
      comparingLabel: "Comparing {count} of {max}",
      clearAll: "Clear all",
      addVehicle: "Add vehicle",
      removePrefix: "Remove",
      best: "Best",
      enquire: "Enquire",
      whatsapp: "WhatsApp",
      rows: {
        price: "Price",
        year: "Year",
        mileage: "Mileage",
        fuel: "Fuel",
        transmission: "Transmission",
        seats: "Seats",
        location: "Location",
      },
    },
  },
  errorPage: {
    eyebrow: "Something went wrong",
    title: "We hit a bump in the road",
    description:
      "We couldn't load this page right now. Please try again — if it keeps happening, reach out to our team.",
    tryAgain: "Try again",
  },
  notFound: {
    page: {
      eyebrow: "Error 404",
      title: "This page took a wrong turn",
      description:
        "The page you're looking for doesn't exist or may have been moved. Let's get you back on the road.",
      backHome: "Back to home",
      browseAllCars: "Browse all cars",
    },
    vehicle: {
      eyebrow: "Vehicle unavailable",
      title: "We couldn't find that vehicle",
      description:
        "It may have been sold or the link has changed. Browse our current stock to find your next car.",
      browseAllCars: "Browse all cars",
      metadataTitle: "Vehicle not found",
    },
  },
  floatingWhatsapp: {
    ariaLabel: "Chat with us on WhatsApp",
    label: "Chat with us",
  },
};

export type Dictionary = typeof en;
