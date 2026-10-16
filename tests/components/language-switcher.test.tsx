import { usePathname } from "next/navigation";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("LanguageSwitcher", () => {
  test("on the english site, the switcher links to the french version of the current path", () => {
    vi.mocked(usePathname).mockReturnValue("/cars");
    render(<LanguageSwitcher locale="en" />);
    expect(screen.getByRole("link", { name: /français/i })).toHaveAttribute("href", "/fr/cars");
  });
  test("on the french site, the switcher links to the unprefixed english path", () => {
    vi.mocked(usePathname).mockReturnValue("/fr/cars");
    render(<LanguageSwitcher locale="fr" />);
    expect(screen.getByRole("link", { name: /english/i })).toHaveAttribute("href", "/cars");
  });
  test("on the english site root, the switcher links to the french root (/fr, not /fr/)", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<LanguageSwitcher locale="en" />);
    expect(screen.getByRole("link", { name: /français/i })).toHaveAttribute("href", "/fr");
  });
  test("on the french site root, the switcher links to the unprefixed root", () => {
    vi.mocked(usePathname).mockReturnValue("/fr");
    render(<LanguageSwitcher locale="fr" />);
    expect(screen.getByRole("link", { name: /english/i })).toHaveAttribute("href", "/");
  });
});
