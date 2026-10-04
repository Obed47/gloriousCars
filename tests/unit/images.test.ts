/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VEHICLE_IMAGE_BUCKET,
  imageRemotePatterns,
  isAllowedImageUrl,
  storagePathFromUrl,
} from "@/lib/images";

const BASE = "https://test-project.supabase.co/storage/v1/object/public/vehicle-images";

describe("isAllowedImageUrl", () => {
  it("accepts a public object in this project's vehicle-images bucket", () => {
    expect(isAllowedImageUrl(`${BASE}/vehicles/abc.jpg`)).toBe(true);
  });

  it("rejects photos hosted anywhere else", () => {
    expect(isAllowedImageUrl("https://images.example.com/car.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://evil.test/storage/v1/object/public/vehicle-images/x.jpg")).toBe(false);
  });

  it("rejects another bucket on the same project", () => {
    expect(
      isAllowedImageUrl("https://test-project.supabase.co/storage/v1/object/public/other-bucket/x.jpg"),
    ).toBe(false);
  });

  it("rejects a private (signed) storage path, which is not public", () => {
    expect(
      isAllowedImageUrl("https://test-project.supabase.co/storage/v1/object/sign/vehicle-images/x.jpg"),
    ).toBe(false);
  });

  it("rejects a different scheme on the same host", () => {
    expect(isAllowedImageUrl(BASE.replace("https:", "http:") + "/x.jpg")).toBe(false);
  });

  it("rejects text that is not a URL", () => {
    expect(isAllowedImageUrl("not a url")).toBe(false);
    expect(isAllowedImageUrl("")).toBe(false);
  });
});

describe("storagePathFromUrl", () => {
  it("returns the object path for one of our uploads", () => {
    expect(storagePathFromUrl(`${BASE}/vehicles/abc.jpg`)).toBe("vehicles/abc.jpg");
  });

  it("decodes percent-encoded characters in the path", () => {
    expect(storagePathFromUrl(`${BASE}/vehicles/my%20photo.jpg`)).toBe("vehicles/my photo.jpg");
  });

  it("returns null for a photo on another host, so it is never deleted from storage", () => {
    expect(storagePathFromUrl("https://images.example.com/vehicles/abc.jpg")).toBeNull();
  });

  it("returns null for a URL outside the storage prefix", () => {
    expect(storagePathFromUrl("https://test-project.supabase.co/rest/v1/vehicles")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(storagePathFromUrl("::::")).toBeNull();
    expect(storagePathFromUrl(`${BASE}/%E0%A4%A`)).toBeNull();
  });

  it("names the bucket the uploads live in", () => {
    expect(VEHICLE_IMAGE_BUCKET).toBe("vehicle-images");
  });
});

describe("imageRemotePatterns", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows only the project's vehicle-images path on its Supabase host", () => {
    expect(imageRemotePatterns()).toEqual([
      {
        protocol: "https",
        hostname: "test-project.supabase.co",
        pathname: "/storage/v1/object/public/vehicle-images/**",
      },
    ]);
  });

  it("allows nothing when Supabase is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(imageRemotePatterns()).toEqual([]);
  });
});
