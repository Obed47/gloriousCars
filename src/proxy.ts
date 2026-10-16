import { LOCALE_COOKIE } from "@/i18n/locales";
import { isStaffPath, resolveLocaleAction, type LocaleAction } from "@/i18n/resolve-locale";
import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function isRedirect(response: NextResponse): boolean {
  return response.status >= 300 && response.status < 400;
}

export function toLocaleResponse(
  action: LocaleAction,
  request: NextRequest,
  carryCookiesFrom?: NextResponse,
): NextResponse {
  // Forwarding the request keeps any session cookies the Supabase client wrote
  // onto it, so the rendered staff page sees the refreshed token.
  const init = carryCookiesFrom ? { request } : undefined;
  let response: NextResponse;
  if (action.kind === "next") {
    response = NextResponse.next(init);
  } else {
    // Clone so the original query string (search prefill, filters, UTM) survives.
    const target = request.nextUrl.clone();
    target.pathname = action.path;
    response =
      action.kind === "rewrite"
        ? NextResponse.rewrite(target, init)
        : NextResponse.redirect(target);
  }

  carryCookiesFrom?.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));

  if (action.kind === "next" || (action.kind === "redirect" && action.path.startsWith("/fr"))) {
    response.cookies.set(LOCALE_COOKIE, "fr", { path: "/", maxAge: ONE_YEAR_SECONDS });
  }

  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Only staff pages need the Supabase session. Running it on public pages made
  // every visit wait on an auth round trip, and a dropped connection then stalled
  // the page for ~25s while auth-js retried a token refresh. The matcher below is
  // broad for locale resolution, so this check is what keeps that scoping.
  let carryCookiesFrom: NextResponse | undefined;
  if (isStaffPath(pathname)) {
    const sessionResponse = await updateSupabaseSession(request);
    if (isRedirect(sessionResponse)) return sessionResponse;
    carryCookiesFrom = sessionResponse;
  }

  const action = resolveLocaleAction(
    pathname,
    request.cookies.get(LOCALE_COOKIE)?.value ?? null,
    request.headers.get("accept-language"),
  );
  return toLocaleResponse(action, request, carryCookiesFrom);
}

export default proxy;

export const config = {
  matcher: [
    // Everything except Next internals, metadata files and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|woff|woff2|ttf|otf)$).*)",
  ],
};
