/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatMileage,
  formatNumber,
  formatPrice,
  formatPriceCompact,
  relativeListedDate,
} from "@/lib/format";

describe("formatPrice", () => {
  it("formats XAF with grouping and no decimals", () => {
    expect(formatPrice(68_500_000, "XAF")).toMatch(/^XAF\s68,500,000$/);
  });

  it("rounds away fractional francs", () => {
    expect(formatPrice(1234.6, "XAF")).toMatch(/^XAF\s1,235$/);
  });
});

describe("formatPriceCompact", () => {
  it("abbreviates large prices", () => {
    expect(formatPriceCompact(68_500_000, "XAF")).toMatch(/^XAF\s68\.5M$/);
    expect(formatPriceCompact(40_000, "XAF")).toMatch(/^XAF\s40K$/);
  });
});

describe("formatMileage and formatNumber", () => {
  it("adds thousands separators and the km unit", () => {
    expect(formatMileage(12_000)).toBe("12,000 km");
    expect(formatNumber(335)).toBe("335");
  });
});

describe("relativeListedDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("says 'today' for a listing from the last 24 hours", () => {
    expect(relativeListedDate("2026-10-04T06:00:00.000Z")).toBe("Listed today");
  });

  it("says 'yesterday' for a listing a day old", () => {
    expect(relativeListedDate("2026-10-03T06:00:00.000Z")).toBe("Listed yesterday");
  });

  it("counts days under a month", () => {
    expect(relativeListedDate("2026-09-29T12:00:00.000Z")).toBe("Listed 5 days ago");
  });

  it("uses singular and plural months", () => {
    expect(relativeListedDate("2026-09-01T12:00:00.000Z")).toBe("Listed 1 month ago");
    expect(relativeListedDate("2026-07-01T12:00:00.000Z")).toBe("Listed 3 months ago");
  });

  it("treats a future date as listed today rather than negative days", () => {
    expect(relativeListedDate("2026-10-10T12:00:00.000Z")).toBe("Listed today");
  });

  it("returns an empty string for an unparseable date", () => {
    expect(relativeListedDate("not a date")).toBe("");
  });
});
