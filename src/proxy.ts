import { updateSupabaseSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

// Only staff pages need the Supabase session. Running it on public pages made
// every visit wait on an auth round trip, and a dropped connection then stalled
// the page for ~25s while auth-js retried a token refresh.
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
