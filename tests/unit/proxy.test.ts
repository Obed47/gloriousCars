/**
 * @vitest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockUpdateSupabaseSession } = vi.hoisted(() => ({
  mockUpdateSupabaseSession: vi.fn<(request: NextRequest) => Promise<NextResponse>>(),
}));

vi.mock("@/lib/supabase/proxy", () => ({
  updateSupabaseSession: mockUpdateSupabaseSession,
}));

import { proxy } from "@/proxy";

function request(path: string, init: { cookie?: string; acceptLanguage?: string } = {}) {
  const headers = new Headers();
  if (init.cookie) headers.set("cookie", init.cookie);
  if (init.acceptLanguage) headers.set("accept-language", init.acceptLanguage);
  return new NextRequest(`https://x.test${path}`, { headers });
}

beforeEach(() => {
  mockUpdateSupabaseSession.mockReset();
  mockUpdateSupabaseSession.mockImplementation(async () => NextResponse.next());
});

describe("proxy: staff paths", () => {
  test("a signed-out visit to /admin returns the supabase redirect untouched, never applying locale rewriting", async () => {
    mockUpdateSupabaseSession.mockResolvedValue(NextResponse.redirect(new URL("https://x.test/login")));
    const response = await proxy(request("/admin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://x.test/login");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  test("a signed-in visit to /admin gets the locale rewrite, carrying the supabase response's cookies", async () => {
    const sessionResponse = NextResponse.next();
    sessionResponse.cookies.set("sb-token", "refreshed");
    mockUpdateSupabaseSession.mockResolvedValue(sessionResponse);
    const response = await proxy(request("/admin"));
    expect(mockUpdateSupabaseSession).toHaveBeenCalledTimes(1);
    expect(response.cookies.get("sb-token")?.value).toBe("refreshed");
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/admin");
  });

  test("the admin search query survives the staff rewrite", async () => {
    const response = await proxy(request("/admin?q=toyota"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/admin?q=toyota");
  });

  test("a refreshed session cookie written onto the request reaches the rewritten render", async () => {
    // Mirrors updateSupabaseSession's setAll: the refreshed token is written onto
    // the request so server components in the same request see it.
    mockUpdateSupabaseSession.mockImplementation(async (req) => {
      req.cookies.set("sb-token", "refreshed");
      const response = NextResponse.next({ request: req });
      response.cookies.set("sb-token", "refreshed");
      return response;
    });
    const response = await proxy(request("/admin/vehicles", { cookie: "sb-token=stale" }));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/admin/vehicles");
    expect(response.headers.get("x-middleware-request-cookie")).toContain("sb-token=refreshed");
  });

  test("/login is forced to english even with a french cookie and header", async () => {
    const response = await proxy(request("/login", { cookie: "NEXT_LOCALE=fr", acceptLanguage: "fr-FR" }));
    expect(mockUpdateSupabaseSession).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/login");
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });
});

describe("proxy: public paths", () => {
  test("a public page never calls updateSupabaseSession", async () => {
    await proxy(request("/cars"));
    expect(mockUpdateSupabaseSession).not.toHaveBeenCalled();
  });

  test("no accept-language header rewrites to english", async () => {
    const response = await proxy(request("/cars"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/cars");
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  test("a french browser is redirected to /fr and the choice is remembered", async () => {
    const response = await proxy(request("/cars", { acceptLanguage: "fr-CM,fr;q=0.9,en;q=0.5" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://x.test/fr/cars");
    const cookie = response.cookies.get("NEXT_LOCALE");
    expect(cookie?.value).toBe("fr");
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
  });

  test("a tampered locale cookie is ignored", async () => {
    const response = await proxy(request("/cars", { cookie: "NEXT_LOCALE=xx" }));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/cars");
  });

  test("a stray /en url redirects to the unprefixed path", async () => {
    const response = await proxy(request("/en/cars"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://x.test/cars");
    expect(mockUpdateSupabaseSession).not.toHaveBeenCalled();
  });

  test("/fr/admin redirects to /admin without touching supabase or planting the french cookie", async () => {
    const response = await proxy(request("/fr/admin", { cookie: "NEXT_LOCALE=fr" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://x.test/admin");
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
    expect(mockUpdateSupabaseSession).not.toHaveBeenCalled();
  });

  test("the query string survives a rewrite", async () => {
    const response = await proxy(request("/cars?brand=toyota&utm_source=x"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://x.test/en/cars?brand=toyota&utm_source=x");
  });

  test("the query string survives a french redirect", async () => {
    const response = await proxy(request("/cars?brand=toyota", { acceptLanguage: "fr-FR" }));
    expect(response.headers.get("location")).toBe("https://x.test/fr/cars?brand=toyota");
  });

  test("the query string survives a stray /en redirect", async () => {
    const response = await proxy(request("/en/cars?brand=toyota"));
    expect(response.headers.get("location")).toBe("https://x.test/cars?brand=toyota");
  });

  test("a /fr page passes through and sets the french cookie", async () => {
    const response = await proxy(request("/fr/cars"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("fr");
  });
});
