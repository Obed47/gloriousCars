/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("next/root-params", () => ({ lang: vi.fn() }));

describe("getDictionary", () => {
  it("returns the french dictionary when lang() resolves fr", async () => {
    const { lang } = await import("next/root-params");
    vi.mocked(lang).mockResolvedValue("fr");
    const { getDictionary } = await import("@/i18n/get-dictionary");
    const { dictionaries } = await import("@/i18n/dictionaries");

    expect(await getDictionary()).toEqual(dictionaries.fr);
  });

  it("falls back to english when lang() resolves an unknown value", async () => {
    const { lang } = await import("next/root-params");
    vi.mocked(lang).mockResolvedValue("de");
    const { getDictionary } = await import("@/i18n/get-dictionary");
    const { dictionaries } = await import("@/i18n/dictionaries");

    expect(await getDictionary()).toEqual(dictionaries.en);
  });
});
