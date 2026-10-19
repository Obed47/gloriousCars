import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { dictionaries } from "@/i18n/dictionaries";
import ErrorPage from "@/app/[lang]/error";
import NotFound from "@/app/[lang]/not-found";
import VehicleNotFound from "@/app/[lang]/cars/[brand]/[slug]/not-found";

// Both not-found pages are async Server Components that resolve the
// dictionary via `getDictionary()`, which reads the root `lang` param
// through `next/root-params` — same mock pattern as
// tests/unit/i18n/get-dictionary.test.ts and tests/components/site.test.tsx.
vi.mock("next/root-params", () => ({ lang: vi.fn() }));

describe("Error page", () => {
  it("shows the French heading and button under the French dictionary", () => {
    render(
      <DictionaryProvider dictionary={dictionaries.fr}>
        <ErrorPage error={new Error("boom")} reset={() => {}} />
      </DictionaryProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "On a heurté un nid de poule" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Réessayer" }),
    ).toBeInTheDocument();
  });
});

describe("NotFound page (root)", () => {
  it("shows the French heading and links under the French dictionary", async () => {
    const { lang } = await import("next/root-params");
    vi.mocked(lang).mockResolvedValue("fr");

    render(await NotFound());

    expect(
      screen.getByRole("heading", { name: "Cette page a pris un mauvais virage" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Retour à l'accueil" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Voir toutes les voitures" }),
    ).toHaveAttribute("href", "/cars");
  });
});

describe("VehicleNotFound page", () => {
  it("shows the French heading and link under the French dictionary", async () => {
    const { lang } = await import("next/root-params");
    vi.mocked(lang).mockResolvedValue("fr");

    render(await VehicleNotFound());

    expect(
      screen.getByRole("heading", { name: "Nous n'avons pas trouvé ce véhicule" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voir toutes les voitures" }),
    ).toHaveAttribute("href", "/cars");
  });
});
