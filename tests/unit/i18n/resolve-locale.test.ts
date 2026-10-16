/**
 * @vitest-environment node
 */
import { describe, expect, test } from "vitest";
import { isStaffPath, prefersFrench, resolveLocaleAction } from "@/i18n/resolve-locale";

describe("resolveLocaleAction", () => {
  test("no accept-language header defaults to english", () => {
    expect(resolveLocaleAction("/cars", null, null)).toEqual({ kind: "rewrite", path: "/en/cars" });
  });
  test("garbage cookie value is treated as absent, falls through to accept-language", () => {
    expect(resolveLocaleAction("/cars", "xx", "fr-FR")).toEqual({ kind: "redirect", path: "/fr/cars" });
  });
  test("admin is forced to english even with a french cookie", () => {
    expect(resolveLocaleAction("/admin", "fr", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/admin" });
  });
  test("login is forced to english even with a french cookie", () => {
    expect(resolveLocaleAction("/login", "fr", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/login" });
  });
  test("a visible /en path redirects to the unprefixed path", () => {
    expect(resolveLocaleAction("/en/cars", null, null)).toEqual({ kind: "redirect", path: "/cars" });
  });
  test("bare /en redirects to /", () => {
    expect(resolveLocaleAction("/en", null, null)).toEqual({ kind: "redirect", path: "/" });
  });
  test("a /fr path passes through untouched", () => {
    expect(resolveLocaleAction("/fr/cars", null, null)).toEqual({ kind: "next" });
  });
  test("unprefixed root with french accept-language redirects to /fr", () => {
    expect(resolveLocaleAction("/", null, "fr-CM,fr;q=0.9,en;q=0.5")).toEqual({ kind: "redirect", path: "/fr" });
  });
  test("existing english cookie takes priority over a french accept-language header", () => {
    expect(resolveLocaleAction("/cars", "en", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/cars" });
  });
});

describe("prefersFrench", () => {
  test.each([
    ["fr-CM,fr;q=0.9,en;q=0.5", true],
    ["en-US,en;q=0.9", false],
    ["", false],
    [null, false],
  ])("prefersFrench(%s) -> %s", (header, expected) => {
    expect(prefersFrench(header)).toBe(expected);
  });
});

describe("isStaffPath", () => {
  test.each([
    ["/admin", true],
    ["/admin/vehicles", true],
    ["/login", true],
    ["/login/reset", true],
    ["/administrator", false],
    ["/loginx", false],
    ["/cars", false],
    ["/", false],
  ])("isStaffPath(%s) -> %s", (pathname, expected) => {
    expect(isStaffPath(pathname)).toBe(expected);
  });
});
