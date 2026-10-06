/**
 * Brands represented in the catalogue. `name` is rendered as a monochrome
 * wordmark (no third-party logo assets are bundled). Counts are derived
 * from live inventory by the repository.
 */
export const brandNames: string[] = [
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Porsche",
  "Toyota",
  "Lexus",
  "Land Rover",
  "Volkswagen",
  "Ford",
  "Hyundai",
  "Kia",
  "Tesla",
  "Peugeot",
];

/**
 * The make at the start of a car name: "Land Rover Defender" → "Land Rover".
 * A make missing from the list falls back to the first word.
 */
export function brandFromName(name: string): string {
  const text = name.trim();
  const lower = text.toLowerCase();
  const known = [...brandNames]
    .sort((a, b) => b.length - a.length)
    .find((b) => lower === b.toLowerCase() || lower.startsWith(`${b.toLowerCase()} `));
  return known ?? text.split(/\s+/)[0] ?? "";
}
