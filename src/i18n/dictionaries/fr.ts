import type { Dictionary } from "./en";

/**
 * French dictionary. Typed against `Dictionary` (derived from `en.ts`), so
 * a namespace or key missing here is a compile error, not a silent gap.
 */
export const fr: Dictionary = {
  common: {
    viewSite: "Voir le site",
    loading: "Chargement…",
  },
  nav: {
    home: "Accueil",
    cars: "Véhicules",
    about: "À propos",
    services: "Services",
    contact: "Contact",
  },
  languageSwitcher: {
    switchToFrench: "Passer au français",
    switchToEnglish: "Passer à l'anglais",
  },
};
