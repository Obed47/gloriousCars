import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
import { CompareTray } from "@/components/site/CompareTray";
import { Footer } from "@/components/site/Footer";
import { Navbar, POPULAR_SEARCHES } from "@/components/site/Navbar";
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
    const dialog = screen.getByRole("dialog", { name: "Search vehicles" });
    for (const { label, href } of POPULAR_SEARCHES) {
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
});

describe("Footer", () => {
  it("shows the current year in the copyright line", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-01T10:00:00Z"));
    try {
      render(<Footer />);
      expect(screen.getByText(/© 2027/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("links to the legal pages and shows the opening hours", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByText("Monday – Friday")).toBeInTheDocument();
  });
});

