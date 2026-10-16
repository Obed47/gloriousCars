/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { localePaths } from "@/i18n/alternates";

describe("localePaths", () => {
  it("root path", () => {
    expect(localePaths("/", "en")).toEqual({
      canonical: "/",
      languages: { en: "/", fr: "/fr", "x-default": "/" },
    });
  });

  it("nested path, french locale canonicalizes to the french url", () => {
    expect(localePaths("/cars", "fr")).toEqual({
      canonical: "/fr/cars",
      languages: { en: "/cars", fr: "/fr/cars", "x-default": "/cars" },
    });
  });

  it("nested path, english locale canonicalizes to the unprefixed url", () => {
    expect(localePaths("/cars", "en")).toEqual({
      canonical: "/cars",
      languages: { en: "/cars", fr: "/fr/cars", "x-default": "/cars" },
    });
  });
});
