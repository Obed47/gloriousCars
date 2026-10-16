import { lang } from "next/root-params";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/home/Hero";
import { HomeCta } from "@/components/home/HomeCta";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { dictionaries } from "@/i18n/dictionaries";

// HomeCta is a Server Component that reads the root `[lang]` param via
// `next/root-params` (the same mechanism `getDictionary()` and `Footer` use
// — see tests/components/site.test.tsx's Footer tests for the pattern).
vi.mock("next/root-params", () => ({ lang: vi.fn() }));

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
    ).toHaveAttribute("href", "/cars");
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
    ).toHaveAttribute("href", "/cars");
    expect(
      screen.getByRole("link", { name: /Discuter sur WhatsApp/i }),
    ).toBeInTheDocument();
  });
});
