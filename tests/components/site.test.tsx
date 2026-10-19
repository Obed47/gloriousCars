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
    for (const { label, href } of POPULAR_SEARCHES) {
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

