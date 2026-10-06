// Settings shared by the end-to-end build and the Playwright run. The
// NEXT_PUBLIC_* values are baked into the build, so both must agree.
export const E2E_PORT = Number(process.env.E2E_PORT ?? 3100);
export const E2E_SUPABASE_PORT = Number(process.env.FAKE_SUPABASE_PORT ?? 54321);

export const E2E_ENV = {
  // A separate build folder, so the end-to-end build never touches `next dev`.
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${E2E_SUPABASE_PORT}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-anon-key",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${E2E_PORT}`,
  // The fake backend is on localhost; allow the image optimiser to fetch from it.
  E2E_ALLOW_LOCAL_IMAGES: "1",
};
