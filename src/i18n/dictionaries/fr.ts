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
  home: {
    metadata: {
      title: "Voitures à vendre à Yaoundé et Douala, Cameroun",
      description:
        "Achetez des voitures de qualité à vendre à Yaoundé, Douala et partout au Cameroun. Comparez des véhicules inspectés, consultez des prix transparents et réservez un essai de conduite chez Glorious Cars.",
    },
    hero: {
      headlineLine1: "Trouvez la voiture qu'il vous faut,",
      headlineLine2: "prête à rouler.",
      description:
        "Parcourez des voitures de qualité à vendre à Yaoundé, Douala et partout au Cameroun, comparez vos options et trouvez celle qui vous correspond.",
      cta: "Voir les voitures",
      imageAlt: "Une sélection de véhicules fiables disponibles chez Glorious Cars",
    },
    quickSearch: {
      ariaLabel: "Recherche rapide de véhicule",
      brandLabel: "Marque",
      anyBrand: "Toutes les marques",
      fuelLabel: "Carburant",
      anyFuel: "Tous les carburants",
      transmissionLabel: "Boîte de vitesses",
      anyTransmission: "Toutes les boîtes",
      yearFromLabel: "Année à partir de",
      anyYear: "Toutes les années",
      maxPriceLabel: "Prix maximum",
      noMaximum: "Aucun maximum",
      upTo: "Jusqu'à",
      searchCars: "Rechercher des voitures",
    },
    featuredVehicles: {
      eyebrow: "Véhicules en vedette",
      title: "Quelques-unes de nos voitures les plus demandées",
      description:
        "Sélectionnées dans notre stock actuel. Cliquez sur une voiture pour voir toutes les photos, les caractéristiques et réserver un essai de conduite.",
      viewAll: "Voir tous les véhicules",
    },
    oilService: {
      eyebrow: "Avant la remise des clés",
      title: "De l'huile neuve, moteur et boîte, dans chaque voiture",
      description:
        "Avant qu'une voiture ne quitte nos mains, nous changeons l'huile moteur et l'huile de boîte avec une huile de qualité et du bon grade. Vous roulez avec une huile neuve dès le premier jour, sans rien à prévoir vous-même.",
      imageAlt: "Huile moteur dorée et propre versée dans un moteur de voiture",
      matchedTitle: "Adaptée à votre voiture",
      matchedBody: "Huile choisie selon les spécifications du constructeur.",
      points: [
        {
          title: "Huile moteur de qualité",
          body: "Huile neuve et scellée, du grade exigé par votre moteur — synthétique ou semi-synthétique.",
        },
        {
          title: "Huile de boîte",
          body: "Le bon fluide pour boîte manuelle ou automatique, pour des passages de vitesses souples et silencieux.",
        },
        {
          title: "Changée avant la livraison",
          body: "Ancienne huile vidangée et huile neuve remise au bon niveau par notre équipe, avant même que les clés ne soient dans vos mains.",
        },
      ],
    },
    aboutStrip: {
      imageAlt: "Une sélection de véhicules de qualité disponibles chez Glorious Cars",
      eyebrow: "À propos de Glorious Cars",
      title: "Plus qu'une voiture. Une meilleure façon de rouler.",
      description:
        "Chaque véhicule que nous proposons est choisi pour sa qualité et sa fiabilité, correctement inspecté et décrit en toute honnêteté — le kilométrage affiché est le vrai kilométrage et les photos sont celles de la voiture réelle. De la première recherche jusqu'à la signature des papiers, une vraie personne vous répond à un message WhatsApp près.",
      cta: "Notre histoire",
    },
    whyChooseUs: {
      eyebrow: "Pourquoi nous choisir",
      title: "Acheter une voiture devrait être aussi simple que ça",
      reasons: [
        {
          title: "Véhicules soigneusement sélectionnés",
          body: "Chaque voiture est choisie pour sa qualité et sa fiabilité, puis inspectée avant d'être mise en ligne.",
        },
        {
          title: "Informations transparentes",
          body: "Caractéristiques claires, prix honnêtes, kilométrage réel et détails complets — sans mauvaise surprise en petits caractères.",
        },
        {
          title: "Essais de conduite faciles",
          body: "Choisissez la date, l'heure et le lieu qui vous conviennent. La confirmation arrive directement sur votre téléphone.",
        },
        {
          title: "Assistance directe",
          body: "Parlez à notre équipe dès que vous avez une question — pas de file d'attente, pas de discours tout fait, juste des réponses sur WhatsApp.",
        },
        {
          title: "Service de confiance",
          body: "Un accompagnement professionnel de la première recherche jusqu'à la remise des clés, et même après.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "Comment ça marche",
      title: "Quatre étapes du premier coup d'œil au premier volant",
      steps: [
        {
          title: "Découvrez",
          body: "Parcourez notre collection et filtrez jusqu'aux véhicules qui correspondent à vos besoins.",
        },
        {
          title: "Explorez",
          body: "Consultez les caractéristiques, toutes les photos et le prix.",
        },
        {
          title: "Vivez l'essai",
          body: "Réservez un essai de conduite à la date, l'heure et le lieu qui vous conviennent.",
        },
        {
          title: "Prenez la route",
          body: "Discutez avec notre équipe sur WhatsApp, passez nous voir et finalisez votre achat.",
        },
      ],
    },
    brandStrip: {
      eyebrow: "Parcourir par marque",
      title: "Commencez par une marque de confiance",
      vehicleSingular: "véhicule",
      vehiclePlural: "véhicules",
    },
    testimonials: {
      eyebrow: "Avis clients",
      title: "La confiance avant tout",
      description: "Quelques mots de personnes qui ont trouvé leur voiture chez nous.",
      regionLabel: "Avis clients",
      previousLabel: "Avis précédents",
      nextLabel: "Avis suivants",
    },
    homeCta: {
      heading: "Votre prochaine voiture est plus proche que vous ne le pensez.",
      description:
        "Découvrez nos véhicules ou parlez directement à notre équipe dès aujourd'hui.",
      exploreCars: "Voir les voitures",
      whatsapp: "Discuter sur WhatsApp",
    },
  },
};
