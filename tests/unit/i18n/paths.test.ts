/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { localizeHref, stripLocalePrefix } from "@/i18n/paths";
import { isLocale } from "@/i18n/locales";

describe("stripLocalePrefix", () => {
  it.each([
    ["/cars", "en", "/cars"],
    ["/en/cars", "en", "/cars"],
    ["/en", "en", "/"],
    ["/", "en", "/"],
    ["/fr", "fr", "/"],
    ["/fr/cars/bmw/x5", "fr", "/cars/bmw/x5"],
    // Only a whole first segment counts as a prefix.
    ["/french-cars", "en", "/french-cars"],
    ["/entry", "en", "/entry"],
  ])("%s → %s %s", (input, locale, pathname) => {
    expect(stripLocalePrefix(input)).toEqual({ locale, pathname });
  });

  it("treats a missing pathname as the english root", () => {
    expect(stripLocalePrefix(null)).toEqual({ locale: "en", pathname: "/" });
  });
});

describe("localizeHref", () => {
  it("leaves english paths unprefixed", () => {
    expect(localizeHref("/cars", "en")).toBe("/cars");
    expect(localizeHref("/", "en")).toBe("/");
  });

  it("prefixes french paths, with /fr (not /fr/) as the root", () => {
    expect(localizeHref("/", "fr")).toBe("/fr");
    expect(localizeHref("/about", "fr")).toBe("/fr/about");
    expect(localizeHref("/cars/bmw/x5-2021", "fr")).toBe("/fr/cars/bmw/x5-2021");
  });

  it("keeps query strings and hashes", () => {
    expect(localizeHref("/cars?brand=BMW", "fr")).toBe("/fr/cars?brand=BMW");
    expect(localizeHref("/services#sales", "fr")).toBe("/fr/services#sales");
    expect(localizeHref("/?x=1", "fr")).toBe("/fr?x=1");
    expect(localizeHref("/cars?brand=BMW", "en")).toBe("/cars?brand=BMW");
  });

  it("re-targets an already prefixed path instead of double-prefixing", () => {
    expect(localizeHref("/fr/cars", "fr")).toBe("/fr/cars");
    expect(localizeHref("/fr/cars", "en")).toBe("/cars");
    expect(localizeHref("/en/cars", "fr")).toBe("/fr/cars");
  });

  it("passes non-path hrefs through untouched", () => {
    for (const href of ["#main", "mailto:a@b.c", "tel:+237", "https://wa.me/1", "//cdn.example/x"]) {
      expect(localizeHref(href, "fr")).toBe(href);
    }
  });
});

describe("isLocale", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("apple-touch-icon.png")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
