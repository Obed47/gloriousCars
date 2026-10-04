import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompareProvider, MAX_COMPARE, useCompare } from "@/components/providers/CompareProvider";
import { FavoritesProvider, useFavorites } from "@/components/providers/FavoritesProvider";

const FAV_KEY = "glorious-cars:favorites";
const CMP_KEY = "glorious-cars:compare";

function FavoritesProbe() {
  const { favorites, count, isFavorite, toggleFavorite, hydrated } = useFavorites();
  return (
    <div>
      <p data-testid="count">{count}</p>
      <p data-testid="ids">{favorites.join(",")}</p>
      <p data-testid="hydrated">{String(hydrated)}</p>
      <p data-testid="bmw-saved">{String(isFavorite("bmw"))}</p>
      <button onClick={() => toggleFavorite("bmw")}>toggle bmw</button>
    </div>
  );
}

function CompareProbe() {
  const { compareIds, toggleCompare, canAddMore, count } = useCompare();
  return (
    <div>
      <p data-testid="ids">{compareIds.join(",")}</p>
      <p data-testid="count">{count}</p>
      <p data-testid="can-add">{String(canAddMore)}</p>
      {["a", "b", "c", "d"].map((id) => (
        <button key={id} onClick={() => toggleCompare(id)}>
          compare {id}
        </button>
      ))}
    </div>
  );
}

describe("FavoritesProvider", () => {
  it("starts empty and saves a favourite to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    await user.click(screen.getByRole("button", { name: "toggle bmw" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem(FAV_KEY) ?? "null")).toEqual(["bmw"]);
  });

  it("removes a favourite when toggled again", async () => {
    const user = userEvent.setup();
    localStorage.setItem(FAV_KEY, JSON.stringify(["bmw"]));
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    await user.click(screen.getByRole("button", { name: "toggle bmw" }));
    expect(screen.getByTestId("bmw-saved")).toHaveTextContent("false");
  });

  it("reads saved favourites after mounting and reports hydration", async () => {
    localStorage.setItem(FAV_KEY, JSON.stringify(["bmw", "audi"]));
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(await screen.findByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("ids")).toHaveTextContent("bmw,audi");
  });

  it("does not crash the whole site when the saved value is corrupt", async () => {
    // Regression: a non-array value (for example from another tool, or an old
    // release) made `favorites.includes` throw, and the providers wrap every page.
    localStorage.setItem(FAV_KEY, JSON.stringify({ corrupt: true }));
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(await screen.findByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("bmw-saved")).toHaveTextContent("false");
  });

  it("ignores non-text entries inside the saved list", async () => {
    localStorage.setItem(FAV_KEY, JSON.stringify(["bmw", 42, null]));
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(await screen.findByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("ids")).toHaveTextContent("bmw");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("survives unparseable JSON", async () => {
    localStorage.setItem(FAV_KEY, "{not json");
    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(await screen.findByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("drops saved vehicles that are no longer in the catalogue", async () => {
    // A car that was sold or deleted must not keep counting in the navbar badge.
    localStorage.setItem(FAV_KEY, JSON.stringify(["bmw", "gone-car"]));
    render(
      <FavoritesProvider knownIds={["bmw"]}>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    expect(await screen.findByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("ids")).toHaveTextContent("bmw");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem(FAV_KEY) ?? "null")).toEqual(["bmw"]);
  });
});

describe("CompareProvider", () => {
  it(`allows at most ${MAX_COMPARE} vehicles`, async () => {
    const user = userEvent.setup();
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );
    await user.click(screen.getByRole("button", { name: "compare a" }));
    await user.click(screen.getByRole("button", { name: "compare b" }));
    await user.click(screen.getByRole("button", { name: "compare c" }));
    expect(screen.getByTestId("can-add")).toHaveTextContent("false");
    await user.click(screen.getByRole("button", { name: "compare d" }));
    expect(screen.getByTestId("ids")).toHaveTextContent("a,b,c");
  });

  it("frees a slot when a vehicle is removed", async () => {
    const user = userEvent.setup();
    localStorage.setItem(CMP_KEY, JSON.stringify(["a", "b", "c"]));
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );
    await user.click(screen.getByRole("button", { name: "compare a" }));
    expect(screen.getByTestId("can-add")).toHaveTextContent("true");
  });

  it("prunes comparison picks that are no longer in the catalogue", async () => {
    // Regression: stale picks kept occupying the three slots, so the compare
    // buttons said "full" while the tray showing them was hidden.
    localStorage.setItem(CMP_KEY, JSON.stringify(["a", "gone-1", "gone-2"]));
    render(
      <CompareProvider knownIds={["a", "b"]}>
        <CompareProbe />
      </CompareProvider>,
    );
    expect(await screen.findByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("can-add")).toHaveTextContent("true");
    expect(JSON.parse(localStorage.getItem(CMP_KEY) ?? "null")).toEqual(["a"]);
  });

  it("does not crash on a corrupt saved value", async () => {
    localStorage.setItem(CMP_KEY, "null");
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );
    expect(await screen.findByTestId("count")).toHaveTextContent("0");
  });

  it("keeps several open tabs in step", async () => {
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: CMP_KEY, newValue: JSON.stringify(["d"]) }),
      );
    });
    expect(screen.getByTestId("ids")).toHaveTextContent("d");
  });

  it("is a no-op for storage events about other keys", () => {
    const spy = vi.fn();
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );
    window.addEventListener("storage", spy);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: "[]" }));
    });
    expect(screen.getByTestId("ids")).toHaveTextContent("");
  });
});
