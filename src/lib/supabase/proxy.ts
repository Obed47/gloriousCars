import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims() verifies the token's signature locally (the project signs with
  // ES256, and the public keys are cached by supabase-js), so it costs no round
  // trip to Supabase, unlike getUser(). It still refreshes an expired session,
  // which is why it must run here and write the new cookies below.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  // Optimistic gate: send signed-out visitors to /login with a real 307.
  // This is only a convenience; the admin pages and Server Actions verify
  // staff access themselves, and row-level security is the final check.
  if (!signedIn && request.nextUrl.pathname.startsWith("/admin")) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
