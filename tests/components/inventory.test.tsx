import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterPanel } from "@/components/cars/FilterPanel";
import { InventoryBrowser } from "@/components/cars/InventoryBrowser";
import { QuickSearch } from "@/components/home/QuickSearch";
import { deriveFilterOptions } from "@/lib/filtering";
import type { VehicleQuery } from "@/lib/types";
import { sampleCatalogue } from "../fixtures/vehicles";
import { renderWithProviders as render } from "../support/render";

const nav = vi.hoisted(() => ({
  pathname: "/cars",
  search: "",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push, replace: nav.replace, refresh() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

// Sold cars never reach the browser from the server, so leave them out here.
const listed = sampleCatalogue().filter((v) => v.status !== "Sold");
const options = deriveFilterOptions(listed);

/** The URL the browser was last asked to show (filters are written with history.replaceState). */
let replaced: ReturnType<typeof vi.spyOn>;
const lastUrl = () => replaced.mock.calls.at(-1)?.[2];

beforeEach(() => {
  nav.search = "";
  nav.push.mockReset();
  replaced = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("InventoryBrowser", () => {
  it("shows every listed vehicle with a count when nothing is filtered", () => {
    render(<InventoryBrowser vehicles={listed} options={options} />);
    expect(screen.getByRole("status")).toHaveTextContent(`${listed.length} vehicles available`);
  });

  it("applies the filters carried in the URL", () => {
    nav.search = "brand=Toyota";
    render(<InventoryBrowser vehicles={listed} options={options} />);
    expect(screen.getByRole("status")).toHaveTextContent(`1 of ${listed.length} vehicles`);
  });

  it("writes a checkbox choice back to the URL without a full reload", async () => {
    const user = userEvent.setup();
    render(<InventoryBrowser vehicles={listed} options={options} />);
    const sidebar = document.querySelector("aside") as HTMLElement;
    await user.click(within(sidebar).getByRole("checkbox", { name: "Toyota" }));
    expect(lastUrl()).toBe("/cars?brand=Toyota");
  });

  it("removes a filter from its chip", async () => {
    const user = userEvent.setup();
    nav.search = "brand=Toyota,Audi";
    render(<InventoryBrowser vehicles={listed} options={options} />);
    await user.click(screen.getByRole("button", { name: /^Toyota/ }));
    expect(lastUrl()).toBe("/cars?brand=Audi");
  });

  it("clears every filter but keeps the chosen sort", async () => {
    const user = userEvent.setup();
    nav.search = "brand=Toyota&sort=price-asc";
    render(<InventoryBrowser vehicles={listed} options={options} />);
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(lastUrl()).toBe("/cars?sort=price-asc");
  });

  it("changes the sort order in the URL", async () => {
    const user = userEvent.setup();
    render(<InventoryBrowser vehicles={listed} options={options} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort vehicles" }), "price-desc");
    expect(lastUrl()).toBe("/cars?sort=price-desc");
  });

  it("explains an empty result and offers a reset", async () => {
    const user = userEvent.setup();
    nav.search = "search=zzzz";
    render(<InventoryBrowser vehicles={listed} options={options} />);
    expect(screen.getByText("No vehicles match your search")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(lastUrl()).toBe("/cars");
  });

  it("uses a valid form control structure in the mobile filter sheet", async () => {
    // Regression: the mobile sort control sat inside a <label>, and SortSelect is
    // itself a <label>, so the sheet contained invalid nested labels.
    const user = userEvent.setup();
    const { container } = render(<InventoryBrowser vehicles={listed} options={options} />);
    await user.click(screen.getByRole("button", { name: /Filter/ }));
    const sheet = screen.getByRole("dialog", { name: "Filter and sort" });
    expect(sheet).toBeInTheDocument();
    expect(sheet.querySelectorAll("label label")).toHaveLength(0);
    expect(container.querySelectorAll("label label")).toHaveLength(0);
  });

  it("closes the mobile filter sheet with the Escape key", async () => {
    const user = userEvent.setup();
    render(<InventoryBrowser vehicles={listed} options={options} />);
    await user.click(screen.getByRole("button", { name: /Filter/ }));
    expect(screen.getByRole("dialog", { name: "Filter and sort" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Filter and sort" })).not.toBeInTheDocument();
  });
});

describe("FilterPanel", () => {
  const baseOptions = deriveFilterOptions(sampleCatalogue());

  it("reports the new brand selection when a brand is ticked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterPanel options={baseOptions} query={{}} onChange={onChange} onReset={() => {}} />,
    );
    await user.click(screen.getByRole("checkbox", { name: "BMW" }));
    expect(onChange).toHaveBeenCalledWith({ brand: ["BMW"] });
  });

  it("unticks a brand that is already selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const query: VehicleQuery = { brand: ["BMW", "Audi"] };
    render(<FilterPanel options={baseOptions} query={query} onChange={onChange} onReset={() => {}} />);
    await user.click(screen.getByRole("checkbox", { name: "BMW" }));
    expect(onChange).toHaveBeenCalledWith({ brand: ["Audi"] });
  });

  it("keeps the price list to a usable length, even for a wide price range", () => {
    // Regression: a fixed XAF 10,000 step produced about 6,000 options per select.
    render(<FilterPanel options={baseOptions} query={{}} onChange={() => {}} onReset={() => {}} />);
    const minSelect = screen.getByRole("combobox", { name: "Min" });
    expect(minSelect.querySelectorAll("option").length).toBeLessThanOrEqual(60);
  });

  it("shows the price that is actually applied, even when it is not a list step", () => {
    // Regression: a URL with a price between list steps showed "Any" while the
    // filter was still applied.
    render(
      <FilterPanel
        options={baseOptions}
        query={{ minPrice: 12_345_678 }}
        onChange={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Min" })).toHaveValue("12345678");
  });

  it("offers a price choice from the list when a price is picked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel options={baseOptions} query={{}} onChange={onChange} onReset={() => {}} />);
    const max = screen.getByRole("combobox", { name: "Max" });
    const first = max.querySelectorAll("option")[1];
    await user.selectOptions(max, first.value);
    expect(onChange).toHaveBeenCalledWith({ maxPrice: Number(first.value) });
  });

  it("clears a numeric filter back to 'Any'", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterPanel
        options={baseOptions}
        query={{ maxYear: 2023 }}
        onChange={onChange}
        onReset={() => {}}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "To" }), "");
    expect(onChange).toHaveBeenCalledWith({ maxYear: undefined });
  });
});

describe("QuickSearch", () => {
  it("opens a results page filtered by the chosen brand and fuel", async () => {
    const user = userEvent.setup();
    render(<QuickSearch options={options} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Brand" }), "Toyota");
    await user.selectOptions(screen.getByRole("combobox", { name: "Fuel" }), "Hybrid");
    await user.click(screen.getByRole("button", { name: "Search Cars" }));
    expect(nav.push).toHaveBeenCalledWith("/cars?brand=Toyota&fuel=Hybrid");
  });

  it("goes to the full inventory when nothing is chosen", async () => {
    const user = userEvent.setup();
    render(<QuickSearch options={options} />);
    await user.click(screen.getByRole("button", { name: "Search Cars" }));
    expect(nav.push).toHaveBeenCalledWith("/cars");
  });

  it("does not offer a 'Up to XAF 0' price when the catalogue is empty", () => {
    // Regression: an empty catalogue produced a single meaningless "Up to XAF 0" option.
    render(<QuickSearch options={deriveFilterOptions([])} />);
    const max = screen.getByRole("combobox", { name: "Max price" });
    const labels = Array.from(max.querySelectorAll("option"), (o) => o.textContent);
    expect(labels).toEqual(["No maximum"]);
  });
});
