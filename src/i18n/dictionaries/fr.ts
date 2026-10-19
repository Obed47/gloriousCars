import type { Dictionary } from "./en";

/**
 * French dictionary. Typed against `Dictionary` (derived from `en.ts`), so
 * a namespace or key missing here is a compile error, not a silent gap.
 */
export const fr: Dictionary = {
  common: {
    viewSite: "Voir le site",
    loading: "Chargement…",
    skipToContent: "Aller au contenu",
    ratedOutOf: "Noté {rating} sur 5",
  },
  nav: {
    home: "Accueil",
    cars: "Véhicules",
    about: "À propos",
    services: "Services",
    contact: "Contact",
    findCar: "Trouver une voiture",
    favorites: "Favoris",
    openMenu: "Ouvrir le menu",
    searchVehicles: "Rechercher des véhicules",
    searchTerm: "Terme de recherche",
    searchPlaceholder: "Rechercher une marque ou un modèle…",
    closeSearch: "Fermer la recherche",
    popular: "Populaires",
    primaryLabel: "Principale",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    popularSearches: {
      hybrid: "Hybride",
      electric: "Électrique",
      automatic: "Automatique",
      underPrice: "Moins de 40 M XAF",
    },
  },
  footer: {
    navigationHeading: "Navigation",
    navigationLabel: "Navigation du pied de page",
    servicesHeading: "Services",
    contactHeading: "Contact",
    services: {
      sales: "Vente de véhicules",
      testDrives: "Essais de conduite",
      consultation: "Conseil automobile",
      assistance: "Financement et assistance",
    },
    chatOnWhatsapp: "Discuter sur WhatsApp",
    addressLine: "Agence de Biyem-Assi",
    country: "Cameroun",
    hours: {
      weekdays: "Lundi – Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
    },
    byAppointment: "Sur rendez-vous",
    rightsReserved: "Tous droits réservés.",
    privacyPolicy: "Politique de confidentialité",
    terms: "Conditions générales",
  },
  stats: {
    vehiclesInStock: "Véhicules en stock",
    happyClients: "Clients satisfaits",
    yearsOnTheRoad: "Années d'expérience",
    whatsappAssistance: "Assistance WhatsApp",
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
  cars: {
    metadata: {
      title: "Voitures à vendre à Yaoundé et Douala, Cameroun",
      descriptionPrefix:
        "Parcourez les voitures à vendre à Yaoundé, Douala et partout au Cameroun chez",
      descriptionSuffix:
        "Filtrez par marque, prix, type de carrosserie, carburant et plus, puis réservez un essai de conduite.",
      ogDescription:
        "Parcourez des voitures inspectées à vendre à Yaoundé, Douala et partout au Cameroun.",
    },
    heading: {
      eyebrow: "Inventaire",
      title: "Voitures à vendre à Yaoundé et Douala",
      description:
        "Comparez les véhicules inspectés disponibles à Yaoundé, Douala et partout au Cameroun, avec des prix transparents et une assistance directe sur WhatsApp.",
    },
    filterPanel: {
      title: "Filtres",
      resetAll: "Tout réinitialiser",
      brand: "Marque",
      price: "Prix",
      year: "Année",
      maxMileage: "Kilométrage max",
      fuel: "Carburant",
      transmission: "Boîte de vitesses",
      colour: "Couleur",
      min: "Min",
      max: "Max",
      from: "De",
      to: "À",
      upTo: "Jusqu'à",
      any: "Indifférent",
      anyMileage: "Kilométrage illimité",
    },
    sort: {
      label: "Trier",
      ariaLabel: "Trier les véhicules",
    },
    sortOptions: {
      featured: "En vedette",
      newest: "Plus récents",
      "price-asc": "Prix : du plus bas au plus élevé",
      "price-desc": "Prix : du plus élevé au plus bas",
      "mileage-asc": "Kilométrage le plus bas",
    },
    toolbar: {
      filterButton: "Filtrer",
      clearAll: "Tout effacer",
      countAvailableSingular: "{count} véhicule disponible",
      countAvailablePlural: "{count} véhicules disponibles",
      countOfTotalSingular: "{shown} sur {total} véhicule",
      countOfTotalPlural: "{shown} sur {total} véhicules",
    },
    emptyState: {
      title: "Aucun véhicule ne correspond à votre recherche",
      description: "Essayez d'élargir votre budget ou de retirer un filtre.",
      resetButton: "Réinitialiser les filtres",
    },
    mobileSheet: {
      ariaLabel: "Filtrer et trier",
      heading: "Filtrer et trier",
      closeFiltersAriaLabel: "Fermer les filtres",
      sortByLabel: "Trier par",
      resetButton: "Réinitialiser",
      showResults: "Afficher {count} résultats",
    },
  },
  vehicleCard: {
    featuredBadge: "En vedette",
    viewDetails: "Voir les détails",
    view: "Voir",
    seatsUnit: "places",
    saveToFavoritesPrefix: "Ajouter",
    toFavoritesSuffix: "aux favoris",
    removeFromFavoritesPrefix: "Retirer",
    fromFavoritesSuffix: "des favoris",
    addToComparisonPrefix: "Ajouter",
    toComparisonSuffix: "à la comparaison",
    removeFromComparisonPrefix: "Retirer",
    fromComparisonSuffix: "de la comparaison",
    compare: "Comparer",
    comparisonFull: "La comparaison est pleine (max 3)",
  },
  vehicleDetail: {
    breadcrumb: {
      ariaLabel: "Fil d'Ariane",
      carsForSale: "Voitures à vendre",
    },
    summary: {
      mileageLabel: "Kilométrage",
      fuelLabel: "Carburant",
      gearboxLabel: "Boîte",
      availableInPrefix: "Disponible à",
      referencePrefix: "Référence",
      listedForSaleByPrefix: "Mis en vente par",
    },
    specs: {
      year: "Année",
      mileage: "Kilométrage",
      fuel: "Carburant",
      transmission: "Boîte de vitesses",
      seats: "Places",
    },
    headings: {
      specsEyebrow: "En un coup d'œil",
      specsTitle: "Caractéristiques principales",
      aboutEyebrow: "Aperçu",
      aboutTitle: "À propos de ce véhicule",
      relatedEyebrow: "Vous pourriez aussi aimer",
      relatedTitle: "Véhicules similaires",
    },
    cta: {
      inquireWhatsApp: "Commander / Demander sur WhatsApp",
      inquireSimilar: "Demander des voitures similaires",
      bookTestDrive: "Réserver un essai de conduite",
      testDriveShort: "Essai de conduite",
    },
    about: {
      readMore: "Voir plus",
      readLess: "Voir moins",
    },
    saveRow: {
      save: "Enregistrer",
      saved: "Enregistré",
      comparing: "En comparaison",
    },
    gallery: {
      openFullscreen: "Ouvrir la galerie en plein écran",
      closeGallery: "Fermer la galerie",
      previousImage: "Image précédente",
      nextImage: "Image suivante",
      viewPrefix: "Voir",
      gallerySuffix: "galerie",
    },
    metadata: {
      forSaleSuffix: "à vendre",
      exploreVehiclePrefix: "Découvrez",
      descriptionSuffix:
        "Fiche technique complète, photos et disponibilité pour un essai de conduite chez",
    },
  },
  statusBadge: {
    available: "Disponible",
    reserved: "Réservé",
    sold: "Vendu",
  },
  whatsapp: {
    vehicleInquiry: {
      greeting: "Bonjour {name}, ce véhicule m'intéresse :",
      vehicleLabel: "Véhicule",
      referenceLabel: "Référence",
      yearLabel: "Année",
      priceLabel: "Prix",
      mileageLabel: "Kilométrage",
      fuelLabel: "Carburant",
      transmissionLabel: "Boîte de vitesses",
      locationLabel: "Lieu",
      closing:
        "J'aimerais en savoir plus et connaître les étapes pour l'achat.",
    },
    testDrive: {
      greeting: "Bonjour {name}, j'aimerais réserver un essai de conduite.",
      vehicleLabel: "Véhicule",
      refLabel: "Réf",
      nameLabel: "Nom",
      phoneLabel: "Téléphone",
      emailLabel: "E-mail",
      preferredDateLabel: "Date souhaitée",
      preferredTimeLabel: "Heure souhaitée",
      preferredLocationLabel: "Lieu souhaité",
      noteLabel: "Note",
    },
    generalInquiry:
      "Bonjour {name}, j'aimerais avoir plus d'informations sur vos véhicules.",
  },
  about: {
    metadata: {
      title: "À propos",
      descriptionSuffix:
        "est une concession de confiance pour des voitures de qualité à vendre à Yaoundé, Douala et partout au Cameroun, fondée sur la transparence et un service direct.",
    },
    hero: {
      eyebrow: "À propos de Glorious Cars",
      title: "Plus qu'une voiture. Une meilleure façon de rouler.",
      description:
        "Nous avons créé Glorious Cars parce qu'acheter une voiture d'occasion ne devrait pas être un pari. Chaque véhicule que nous proposons est choisi pour sa qualité, correctement inspecté et décrit en toute honnêteté — et une vraie personne n'est jamais qu'à un message de vous.",
      imageAlt:
        "Une sélection de véhicules de qualité disponibles chez Glorious Cars",
      statsDisclaimer:
        "Les chiffres affichés sont des exemples pour cette démonstration.",
    },
    approach: {
      eyebrow: "Notre démarche",
      title: "La qualité d'abord, tout le reste suit",
      paragraphs: [
        "L'approvisionnement est réfléchi. Nous achetons des véhicules à l'historique clair et aux carnets d'entretien vérifiables, puis nous faisons passer à chacun d'eux une inspection à plusieurs points avant qu'il ne soit photographié et mis en ligne. Si une voiture ne répond pas à nos critères, elle ne paraît pas sur le site.",
        "L'information est complète. Le kilométrage affiché est celui du compteur. Les photos sont celles de la voiture réelle, pas une image d'illustration. Les caractéristiques clés et les défauts connus sont indiqués pour que vous puissiez décider avant votre visite. Pour tout autre détail, demandez-nous sur WhatsApp.",
        "Le service est direct. De la première question à la remise des clés, vous échangez avec notre équipe sur WhatsApp et en personne — sans centre d'appels, sans discours préparé et sans pression pour décider sur place.",
      ],
    },
  },
  services: {
    metadata: {
      title: "Services",
      descriptionPrefix:
        "Vente de véhicules, essais de conduite, conseil et accompagnement à l'achat chez",
      descriptionSuffix:
        ", avec une huile moteur et de boîte neuve dans chaque voiture que nous livrons.",
    },
    hero: {
      eyebrow: "Services",
      title: "Tout ce qui touche à la voiture, pris en charge",
      description:
        "De la première recherche à la signature des papiers, voici comment nous vous accompagnons.",
    },
    items: {
      sales: {
        title: "Vente de véhicules",
        body: "Un inventaire sélectionné et inspecté, toutes marques et tous budgets. Parcourez en ligne, filtrez selon vos critères et réservez la voiture qui vous convient.",
        ctaLabel: "Voir l'inventaire",
      },
      testDrives: {
        title: "Essais de conduite",
        body: "Réservez un essai de conduite à la date, l'heure et le lieu qui vous conviennent. Nous pouvons amener le véhicule près de chez vous si possible.",
        ctaLabel: "Voir les voitures disponibles",
      },
      consultation: {
        title: "Conseil automobile",
        body: "Vous ne savez pas quelle voiture correspond à vos besoins ? Donnez-nous votre budget, votre usage et vos priorités, et nous vous proposerons une sélection — honnêtement, y compris des modèles que nous n'avons pas en stock.",
        ctaLabel: "Demander à notre équipe",
      },
      assistance: {
        title: "Financement et accompagnement",
        body: "Accompagnement pour les papiers, le transfert, les assurances et les partenaires de financement. Nous faisons avancer le dossier pour que vous preniez la route plus vite.",
        ctaLabel: "Discuter des options",
      },
      oilService: {
        title: "Huile moteur et boîte",
        body: "Chaque voiture que nous livrons reçoit une huile moteur et de boîte neuve et de qualité, adaptée aux spécifications du constructeur et changée par notre équipe avant la remise.",
      },
    },
    cta: {
      heading: "Une question sur l'un de ces services ?",
      whatsappButton: "Écrivez-nous sur WhatsApp",
      contactButton: "Page contact",
    },
  },
  contact: {
    metadata: {
      title: "Contact",
      descriptionPrefix: "Contactez",
      descriptionMiddle:
        "au sujet des voitures à vendre à Yaoundé, Douala et partout au Cameroun — WhatsApp, téléphone, e-mail ou visitez notre showroom à",
      descriptionSuffix: ".",
    },
    hero: {
      eyebrow: "Contact",
      title: "Parlez à notre équipe",
      description:
        "Le moyen le plus rapide de nous joindre est WhatsApp — la plupart des messages reçoivent une réponse dans l'heure pendant nos horaires d'ouverture.",
    },
    whatsappCard: {
      title: "WhatsApp",
      subtitle: "Discutez avec nous maintenant — réponse la plus rapide",
    },
    cards: {
      phone: "Téléphone",
      email: "E-mail",
      showroom: "Showroom",
    },
    openingHours: {
      title: "Horaires d'ouverture",
    },
    form: {
      nameLabel: "Nom",
      phoneLabel: "Téléphone",
      emailLabel: "E-mail",
      subjectLabel: "Sujet",
      messageLabel: "Message",
      subjects: [
        "Question générale",
        "Acheter un véhicule",
        "Réserver un essai de conduite",
        "Vendre ma voiture",
        "Autre chose",
      ],
      messageGreeting: "Bonjour {name},",
      submitButton: "Envoyer via WhatsApp",
      disclaimer:
        "Cela ouvre WhatsApp avec votre message prérempli — rien n'est envoyé avant que vous n'appuyiez sur envoyer là-bas.",
      successEyebrow: "Message prêt",
      successHeading: "Nous avons ouvert WhatsApp pour vous",
      successBodyPrefix:
        "Envoyez le message prérempli et notre équipe vous répondra rapidement. Vous préférez l'e-mail ? Écrivez à",
      successBodySuffix: ".",
      editMessageButton: "Modifier le message",
    },
  },
  testDrive: {
    title: "Réservez votre essai de conduite",
    description: "Découvrez le véhicule avant de prendre votre décision.",
    confirmedTitle: "Votre essai de conduite est demandé",
    confirmedDescription:
      "Vos informations ont été ouvertes dans WhatsApp. Notre équipe vous contactera prochainement pour confirmer votre rendez-vous.",
    closeAriaLabel: "Fermer",
    refLabel: "Réf",
    fields: {
      fullName: "Nom complet",
      phoneNumber: "Numéro de téléphone",
      email: "E-mail",
      preferredDate: "Date souhaitée",
      preferredTime: "Heure souhaitée",
      preferredLocation: "Lieu souhaité",
      additionalMessage: "Message complémentaire",
    },
    messagePlaceholder: "Y a-t-il autre chose à savoir avant votre visite ?",
    submitButton: "Confirmer l'essai de conduite",
    errors: {
      nameRequired: "Veuillez indiquer votre nom.",
      phoneRequired: "Un numéro de téléphone est nécessaire pour confirmer.",
      emailInvalid: "Cette adresse e-mail ne semble pas correcte.",
      dateRequired: "Choisissez une date souhaitée.",
      dateInPast: "Choisissez une date à partir d'aujourd'hui.",
      timeRequired: "Choisissez un créneau horaire.",
    },
    confirmation: {
      vehicleLabel: "Véhicule",
      dateLabel: "Date",
      timeLabel: "Heure",
      locationLabel: "Lieu",
      reopenButton: "Rouvrir WhatsApp",
      doneButton: "Terminé",
    },
  },
  privacy: {
    metadata: {
      title: "Politique de confidentialité",
      description: "Comment {name} gère vos informations.",
    },
    title: "Politique de confidentialité",
    disclaimer:
      "Ce texte est un espace réservé pour la démonstration. Remplacez-le par une politique validée par votre conseiller juridique avant la mise en ligne.",
    sections: [
      {
        heading: "Informations que nous collectons",
        body: "Lorsque vous réservez un essai de conduite ou nous envoyez une demande, nous collectons les informations que vous fournissez — telles que votre nom, votre numéro de téléphone et votre adresse e-mail — afin de pouvoir vous répondre et organiser votre rendez-vous. Les favoris et les sélections de comparaison sont conservés uniquement dans votre navigateur.",
      },
      {
        heading: "Comment nous les utilisons",
        body: "Nous utilisons vos informations uniquement pour répondre à votre demande, organiser les essais de conduite et finaliser un achat si vous décidez de poursuivre. Nous ne vendons pas vos données.",
      },
      {
        heading: "WhatsApp",
        body: "Les messages que vous nous envoyez via WhatsApp sont soumis aux conditions de confidentialité propres à WhatsApp, en complément des nôtres.",
      },
    ],
    contact: {
      heading: "Contact",
      prefix: "Des questions sur vos données ? Écrivez-nous à",
      suffix: ".",
    },
  },
  terms: {
    metadata: {
      title: "Conditions générales d'utilisation",
      description: "Conditions d'utilisation du site {name}.",
    },
    title: "Conditions générales d'utilisation",
    disclaimer:
      "Ce texte est un espace réservé pour la démonstration. Remplacez-le par des conditions validées par votre conseiller juridique avant la mise en ligne.",
    sections: [
      {
        heading: "Informations sur les véhicules",
        body: "Nous veillons à décrire chaque véhicule avec précision, notamment le kilométrage, les caractéristiques et l'état général. Les annonces ne constituent pas une offre contractuelle ; la disponibilité et le prix sont confirmés au moment de la vente.",
      },
      {
        heading: "Essais de conduite",
        body: "Les demandes d'essai de conduite sont soumises à la confirmation de notre équipe et à la présentation d'un permis de conduire valide. Les horaires demandés sont des préférences et non des réservations garanties.",
      },
      {
        heading: "Aucun paiement en ligne",
        body: "Ce site n'effectue aucun paiement en ligne. Tout achat est finalisé directement avec {legalName}.",
      },
      {
        heading: "Responsabilité",
        body: "Le site est fourni « tel quel ». Dans la limite autorisée par la loi, {legalName} ne saurait être tenue responsable des pertes indirectes ou consécutives résultant de l'utilisation du site.",
      },
    ],
  },
  favorites: {
    metadata: {
      title: "Mes favoris",
      description: "Véhicules que vous avez enregistrés.",
    },
    heading: {
      eyebrow: "Enregistrés pour plus tard",
      title: "Mes favoris",
      description:
        "Votre sélection, conservée sur cet appareil. Revenez à tout moment pour reprendre là où vous vous étiez arrêté.",
    },
    view: {
      emptyState: {
        title: "Aucun véhicule enregistré pour le moment",
        description:
          "Touchez le cœur sur un véhicule pour le conserver ici. Les favoris sont stockés sur cet appareil.",
      },
      browseAllCars: "Voir toutes les voitures",
      savedCountSingular: "{count} véhicule enregistré",
      savedCountPlural: "{count} véhicules enregistrés",
      clearAll: "Tout effacer",
    },
  },
  compare: {
    metadata: {
      title: "Comparer des véhicules",
      description: "Comparez jusqu'à trois véhicules côte à côte.",
    },
    heading: {
      eyebrow: "Côte à côte",
      title: "Comparer les véhicules",
      description:
        "Comparez les chiffres qui comptent — prix, kilométrage, puissance et plus encore — et repérez les différences en un coup d'œil.",
    },
    tray: {
      ariaLabel: "Plateau de comparaison des véhicules",
      selectedCount: "{count} sur {max} sélectionnés",
      clearAll: "Tout effacer",
      clear: "Effacer",
      removeFromComparisonPrefix: "Retirer",
      removeFromComparisonSuffix: "de la comparaison",
      compareLink: "Comparer",
    },
    view: {
      emptyState: {
        title: "Rien à comparer pour le moment",
        description:
          "Ajoutez jusqu'à {max} véhicules grâce au bouton de comparaison sur une fiche, puis consultez-les côte à côte ici.",
      },
      browseAllCars: "Voir toutes les voitures",
      comparingLabel: "Comparaison de {count} sur {max}",
      clearAll: "Tout effacer",
      addVehicle: "Ajouter un véhicule",
      removePrefix: "Retirer",
      best: "Meilleur",
      enquire: "Demande",
      whatsapp: "WhatsApp",
      rows: {
        price: "Prix",
        year: "Année",
        mileage: "Kilométrage",
        fuel: "Carburant",
        transmission: "Boîte de vitesses",
        seats: "Places",
        location: "Lieu",
      },
    },
  },
  errorPage: {
    eyebrow: "Un problème est survenu",
    title: "On a heurté un nid de poule",
    description:
      "Nous n'avons pas pu charger cette page pour le moment. Veuillez réessayer — si le problème persiste, contactez notre équipe.",
    tryAgain: "Réessayer",
  },
  notFound: {
    page: {
      eyebrow: "Erreur 404",
      title: "Cette page a pris un mauvais virage",
      description:
        "La page que vous recherchez n'existe pas ou a peut-être été déplacée. Revenons sur la bonne route.",
      backHome: "Retour à l'accueil",
      browseAllCars: "Voir toutes les voitures",
    },
    vehicle: {
      eyebrow: "Véhicule indisponible",
      title: "Nous n'avons pas trouvé ce véhicule",
      description:
        "Il a peut-être été vendu ou le lien a changé. Parcourez notre stock actuel pour trouver votre prochaine voiture.",
      browseAllCars: "Voir toutes les voitures",
      metadataTitle: "Véhicule introuvable",
    },
  },
  floatingWhatsapp: {
    ariaLabel: "Discuter avec nous sur WhatsApp",
    label: "Discuter avec nous",
  },
};
