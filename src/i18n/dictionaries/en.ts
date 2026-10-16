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
};

export type Dictionary = typeof en;
