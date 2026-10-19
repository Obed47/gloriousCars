import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
import { CompareTray } from "@/components/site/CompareTray";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { Navbar, POPULAR_SEARCHES } from "@/components/site/Navbar";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { dictionaries } from "@/i18n/dictionaries";
import { SITE_COPY } from "@/lib/site";
import { toSummary } from "@/lib/repository";
import { sampleCatalogue } from "../fixtures/vehicles";

const nav = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push, replace: nav.replace, refresh() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
}));

// Footer is a Server Component that reads the root `[lang]` param via
// `next/root-params`; outside Next's own build/runtime that module is a
// placeholder that throws, so it needs the same mock get-dictionary.test.ts
// uses. Left unresolved, `lang()` yields `undefined`, which both `Footer`
// and `getDictionary()` treat as the default English locale — matching
// every assertion below unchanged.
vi.mock("next/root-params", () => ({ lang: vi.fn() }));

beforeEach(() => {
  nav.pathname = "/";
  nav.push.mockReset();
  nav.replace.mockReset();
});

describe("Navbar search", () => {
  async function openSearch() {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <Navbar />
      </FavoritesProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Search vehicles" }));
    return user;
  }

  it("opens a search dialog and submits a typed term", async () => {
    const user = await openSearch();
    const dialog = screen.getByRole("dialog", { name: "Search vehicles" });
    await user.type(within(dialog).getByRole("textbox", { name: "Search term" }), "rav4{enter}");
    expect(nav.push).toHaveBeenCalledWith("/cars?search=rav4");
  });

  it("offers quick links that land on working results", async () => {
    // Regression: "Automatic" and "Under XAF 40,000" searched text that no
    // vehicle contains, so they always showed an empty page.
    const user = await openSearch();
    const dialog = screen.getByRole("dialog", { name: "Search vehicles" });
    await user.click(within(dialog).getByRole("button", { name: "Automatic" }));
    expect(nav.push).toHaveBeenCalledWith("/cars?transmission=Automatic");
  });

  it("every popular quick link opens the matching filter", async () => {
    const user = await openSearch();
    for (const item of POPULAR_SEARCHES) {
      const { href } = item;
      const label = item.label(dictionaries.en.nav);
      // Look the dialog up again each time: it unmounts after every preset.
      const dialog = screen.getByRole("dialog", { name: "Search vehicles" });
      await user.click(within(dialog).getByRole("button", { name: label }));
      expect(nav.push, label).toHaveBeenLastCalledWith(href);
      expect(href, label).not.toMatch(/search=/);
      await user.click(screen.getByRole("button", { name: "Search vehicles" }));
    }
  });
});

describe("Navbar favourites badge", () => {
  it("shows the number of saved vehicles", () => {
    localStorage.setItem("glorious-cars:favorites", JSON.stringify(["a", "b"]));
    render(
      <FavoritesProvider>
        <Navbar />
      </FavoritesProvider>,
    );
    expect(screen.getByRole("link", { name: "Favorites (2)" })).toBeInTheDocument();
  });

  it("counts only saved vehicles that still exist", () => {
    localStorage.setItem("glorious-cars:favorites", JSON.stringify(["a", "sold-car"]));
    render(
      <FavoritesProvider knownIds={["a"]}>
        <Navbar />
      </FavoritesProvider>,
    );
    expect(screen.getByRole("link", { name: "Favorites (1)" })).toBeInTheDocument();
  });
});

describe("CompareTray", () => {
  const summaries = sampleCatalogue().map(toSummary);

  it("is hidden when nothing is being compared", () => {
    render(
      <CompareProvider>
        <CompareTray summaries={summaries} />
      </CompareProvider>,
    );
    expect(screen.queryByRole("region", { name: "Vehicle comparison tray" })).not.toBeInTheDocument();
  });

  it("lists the selected vehicles and the count", () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify([summaries[0].id, summaries[1].id]));
    render(
      <CompareProvider>
        <CompareTray summaries={summaries} />
      </CompareProvider>,
    );
    const tray = screen.getByRole("region", { name: "Vehicle comparison tray" });
    expect(within(tray).getByText("2 of 3 selected")).toBeInTheDocument();
  });

  it("counts only vehicles it can show", () => {
    // Regression: a pick whose car was sold made the tray say "3 of 3" while
    // showing two cars, which also blocked adding a new car.
    localStorage.setItem(
      "glorious-cars:compare",
      JSON.stringify([summaries[0].id, summaries[1].id, "sold-car"]),
    );
    render(
      <CompareProvider knownIds={summaries.map((s) => s.id)}>
        <CompareTray summaries={summaries} />
      </CompareProvider>,
    );
    const tray = screen.getByRole("region", { name: "Vehicle comparison tray" });
    expect(within(tray).getByText("2 of 3 selected")).toBeInTheDocument();
  });

  it("has a Compare link to the comparison page", () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify([summaries[0].id]));
    render(
      <CompareProvider>
        <CompareTray summaries={summaries} />
      </CompareProvider>,
    );
    expect(screen.getByRole("link", { name: /compare/i })).toHaveAttribute("href", "/compare");
  });

  it("shows the selected count in French under the French dictionary", () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify([summaries[0].id, summaries[1].id]));
    render(
      <CompareProvider>
        <DictionaryProvider dictionary={dictionaries.fr}>
          <CompareTray summaries={summaries} />
        </DictionaryProvider>
      </CompareProvider>,
    );
    const tray = screen.getByRole("region", { name: "Plateau de comparaison des véhicules" });
    expect(within(tray).getByText("2 sur 3 sélectionnés")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  // Footer is an async Server Component, so it must be awaited before the
  // resolved element is handed to `render` — React's client reconciler
  // (what RTL uses here) can't call an async component itself.
  it("shows the current year in the copyright line", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-01T10:00:00Z"));
    try {
      render(await Footer());
      expect(screen.getByText(/© 2027/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("links to the legal pages and shows the opening hours", async () => {
    render(await Footer());
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByText("Monday – Friday")).toBeInTheDocument();
  });

  it("shows the French description under the French dictionary", async () => {
    vi.mocked((await import("next/root-params")).lang).mockResolvedValue("fr");
    render(await Footer());
    expect(screen.getByText(SITE_COPY.fr.description)).toBeInTheDocument();
  });
});

describe("FloatingWhatsApp", () => {
  it("shows the French aria-label and tooltip text under the French dictionary", async () => {
    vi.useFakeTimers();
    try {
      render(
        <DictionaryProvider dictionary={dictionaries.fr}>
          <FloatingWhatsApp />
        </DictionaryProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });
      expect(
        screen.getByRole("link", { name: "Discuter avec nous sur WhatsApp" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Discuter avec nous")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("SiteJsonLd", () => {
  it("renders the French SITE_COPY description when given the French locale", () => {
    render(<SiteJsonLd locale="fr" />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script?.textContent).toContain(SITE_COPY.fr.description);
  });
});


// `usePathname()` reports the proxy's internal rewritten path (`/en/cars`)
// while a page renders on the server, and the browser's path (`/cars`) once
// it hydrates. Routing logic must give the same answer for both.
describe("Navbar routing state under the internal rewritten path", () => {
  function renderNavbar(dictionary = dictionaries.en) {
    return render(
      <FavoritesProvider>
        <DictionaryProvider dictionary={dictionary}>
          <Navbar />
        </DictionaryProvider>
      </FavoritesProvider>,
    );
  }

  it.each(["/en/cars", "/cars"])(
    "on %s, marks Cars active and the switcher targets /fr/cars",
    (pathname) => {
      nav.pathname = pathname;
      renderNavbar();
      const cars = screen.getByRole("link", { name: "Cars" });
      expect(cars).toHaveAttribute("aria-current", "page");
      expect(cars).toHaveAttribute("href", "/cars");
      expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
      expect(screen.getByRole("link", { name: /^(FR|Français)/ })).toHaveAttribute("href", "/fr/cars");
    },
  );

  it("on a french page, links point at the french urls and Véhicules is active", () => {
    nav.pathname = "/fr/cars";
    renderNavbar(dictionaries.fr);
    const cars = screen.getByRole("link", { name: "Véhicules" });
    expect(cars).toHaveAttribute("aria-current", "page");
    expect(cars).toHaveAttribute("href", "/fr/cars");
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr");
    expect(screen.getByRole("link", { name: "À propos" })).toHaveAttribute("href", "/fr/about");
    expect(screen.getByRole("link", { name: "Favoris" })).toHaveAttribute("href", "/fr/favorites");
    expect(screen.getByRole("link", { name: /Trouver une voiture/ })).toHaveAttribute("href", "/fr/cars");
    expect(screen.getByRole("link", { name: /^(EN|English)/ })).toHaveAttribute("href", "/cars");
  });

  it.each([
    ["/", dictionaries.en],
    ["/en", dictionaries.en],
    ["/fr", dictionaries.fr],
  ])("uses the hero header style on the home page (%s)", (pathname, dictionary) => {
    nav.pathname = pathname;
    const { container } = renderNavbar(dictionary);
    expect(container.querySelector("header")).toHaveClass("bg-ink");
  });

  it("uses the regular header style away from the home page", () => {
    nav.pathname = "/fr/cars";
    const { container } = renderNavbar(dictionaries.fr);
    expect(container.querySelector("header")).not.toHaveClass("bg-ink");
  });
});

describe("Navbar under the French dictionary", () => {
  it("translates its chrome and keeps searches on the french site", async () => {
    nav.pathname = "/fr";
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <DictionaryProvider dictionary={dictionaries.fr}>
          <Navbar />
        </DictionaryProvider>
      </FavoritesProvider>,
    );
    expect(screen.getByRole("button", { name: "Ouvrir le menu" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Rechercher des véhicules" }));
    const dialog = screen.getByRole("dialog", { name: "Rechercher des véhicules" });
    expect(within(dialog).getByText("Populaires")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fermer la recherche" })).toBeInTheDocument();
    const input = within(dialog).getByRole("textbox", { name: "Terme de recherche" });
    expect(input).toHaveAttribute("placeholder", "Rechercher une marque ou un modèle…");
    for (const label of ["Hybride", "Électrique", "Automatique", "Moins de 40 M XAF"]) {
      expect(within(dialog).getByRole("button", { name: label })).toBeInTheDocument();
    }
    await user.click(within(dialog).getByRole("button", { name: "Hybride" }));
    expect(nav.push).toHaveBeenLastCalledWith("/fr/cars?fuel=Hybrid");

    await user.click(screen.getByRole("button", { name: "Rechercher des véhicules" }));
    await user.type(screen.getByRole("textbox", { name: "Terme de recherche" }), "rav4{enter}");
    expect(nav.push).toHaveBeenLastCalledWith("/fr/cars?search=rav4");
  });
});

describe("Footer links under the French locale", () => {
  it("points every internal link at the french url", async () => {
    nav.pathname = "/fr/about";
    const rootParams = await import("next/root-params");
    vi.mocked(rootParams.lang).mockResolvedValue("fr");
    render(
      <DictionaryProvider dictionary={dictionaries.fr}>
        {await Footer()}
      </DictionaryProvider>,
    );
    const footer = screen.getByRole("contentinfo");
    const internal = within(footer)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"));
    expect(internal.length).toBeGreaterThan(5);
    // The language switcher is the one link that leaves the french site.
    const french = internal.filter((href) => href !== "/about");
    for (const href of french) expect(href).toMatch(/^\/fr(\/|#|$)/);
    expect(internal).toContain("/fr/services#sales");
    expect(internal).toContain("/fr/privacy");
  });
});

describe("FloatingWhatsApp route checks", () => {
  async function renderBubble(pathname: string) {
    nav.pathname = pathname;
    vi.useFakeTimers();
    try {
      render(<FloatingWhatsApp />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });
    } finally {
      vi.useRealTimers();
    }
    return screen.queryByRole("link", { name: "Chat with us on WhatsApp" });
  }

  it.each(["/cars/bmw/x5-2021", "/en/cars/bmw/x5-2021", "/fr/cars/bmw/x5-2021"])(
    "is raised clear of the action bar on the detail page %s",
    async (pathname) => {
      expect(await renderBubble(pathname)).toHaveClass("bottom-24");
    },
  );

  it("sits low on other pages", async () => {
    expect(await renderBubble("/fr/cars")).toHaveClass("bottom-5");
  });

  it.each(["/admin", "/en/admin", "/en/login"])("is hidden on staff page %s", async (pathname) => {
    expect(await renderBubble(pathname)).not.toBeInTheDocument();
  });
});

describe("Footer chrome under the French locale", () => {
  it("translates headings, service links, contact, hours and legal links", async () => {
    nav.pathname = "/fr";
    const rootParams = await import("next/root-params");
    vi.mocked(rootParams.lang).mockResolvedValue("fr");
    render(await Footer());
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("navigation", { name: "Navigation du pied de page" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Vente de véhicules" })).toHaveAttribute("href", "/fr/services#sales");
    expect(within(footer).getByRole("link", { name: "Financement et assistance" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: /Discuter sur WhatsApp/ })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Politique de confidentialité" })).toHaveAttribute("href", "/fr/privacy");
    expect(within(footer).getByRole("link", { name: "Conditions générales" })).toHaveAttribute("href", "/fr/terms");
    expect(within(footer).getByText(/Tous droits réservés\./)).toBeInTheDocument();
    expect(within(footer).getByText("Lundi – Vendredi")).toBeInTheDocument();
    expect(within(footer).getByText("Sur rendez-vous")).toBeInTheDocument();
    expect(within(footer).getByText(/Yaoundé, Cameroun/)).toBeInTheDocument();
    for (const english of ["Vehicle Sales", "Chat on WhatsApp", "Privacy Policy", "Monday – Friday", "By appointment"]) {
      expect(within(footer).queryByText(english)).not.toBeInTheDocument();
    }
  });

  it("keeps the English copy byte-identical under the English locale", async () => {
    vi.mocked((await import("next/root-params")).lang).mockResolvedValue("en");
    render(await Footer());
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("navigation", { name: "Footer navigation" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Terms & Conditions" })).toBeInTheDocument();
    expect(within(footer).getByText(/All rights reserved\./)).toBeInTheDocument();
    expect(within(footer).getByText("By appointment")).toBeInTheDocument();
    expect(within(footer).getByText(/Biyem-Assi Branch/)).toBeInTheDocument();
  });
});

describe("Navbar landmarks and mobile menu under the French dictionary", () => {
  it("translates the Primary, Menu and Close menu labels", async () => {
    nav.pathname = "/fr";
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <DictionaryProvider dictionary={dictionaries.fr}>
          <Navbar />
        </DictionaryProvider>
      </FavoritesProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Principale" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(within(menu).getByRole("button", { name: "Fermer le menu" })).toBeInTheDocument();
  });
});
