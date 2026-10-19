import { lang } from "next/root-params";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AboutStrip } from "@/components/home/AboutStrip";
import { Hero } from "@/components/home/Hero";
import { HomeCta } from "@/components/home/HomeCta";
import { StarRating } from "@/components/ui/StarRating";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { dictionaries } from "@/i18n/dictionaries";

// HomeCta is a Server Component that reads the root `[lang]` param via
// `next/root-params` (the same mechanism `getDictionary()` and `Footer` use
// — see tests/components/site.test.tsx's Footer tests for the pattern).
vi.mock("next/root-params", () => ({ lang: vi.fn() }));
// Internal links read the current locale off the pathname (see
// src/i18n/locale-link.tsx); these tests render the French home page.
vi.mock("next/navigation", () => ({ usePathname: () => "/fr" }));

beforeEach(() => {
  vi.mocked(lang).mockResolvedValue("fr");
});

describe("Hero", () => {
  it("renders the french headline and CTA inside a french DictionaryProvider", () => {
    render(
      <DictionaryProvider dictionary={dictionaries.fr}>
        <Hero />
      </DictionaryProvider>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Trouvez la voiture qu'il vous faut/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/prête à rouler/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voir les voitures" }),
    ).toHaveAttribute("href", "/fr/cars");
  });
});

describe("HomeCta", () => {
  // HomeCta is an async Server Component, so it must be awaited before the
  // resolved element is handed to `render` (RTL can't call it itself).
  it("renders the french heading and CTAs when lang() resolves fr", async () => {
    render(await HomeCta());

    expect(
      screen.getByRole("heading", {
        name: /Votre prochaine voiture est plus proche/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voir les voitures" }),
    ).toHaveAttribute("href", "/fr/cars");
    expect(
      screen.getByRole("link", { name: /Discuter sur WhatsApp/i }),
    ).toBeInTheDocument();
  });
});

describe("AboutStrip", () => {
  it("shows the stats labels in French and links to the french about page", async () => {
    render(await AboutStrip());
    for (const label of ["Véhicules en stock", "Clients satisfaits", "Années d'expérience", "Assistance WhatsApp"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText("Vehicles in stock")).not.toBeInTheDocument();
  });
});

describe("StarRating", () => {
  it("interpolates the rating into the English label", () => {
    render(<StarRating rating={4} />);
    expect(screen.getByRole("img", { name: "Rated 4 out of 5" })).toBeInTheDocument();
  });

  it("interpolates the rating into the French label", () => {
    render(
      <DictionaryProvider dictionary={dictionaries.fr}>
        <StarRating rating={5} />
      </DictionaryProvider>,
    );
    expect(screen.getByRole("img", { name: "Noté 5 sur 5" })).toBeInTheDocument();
  });
});
