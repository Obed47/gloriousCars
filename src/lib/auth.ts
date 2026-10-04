import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor";

export interface Session {
  id: string;
  email: string;
  /** `null` when signed in but not listed in `public.profiles`. */
  role: StaffRole | null;
}

export interface Staff extends Session {
  role: StaffRole;
}

/**
 * The signed-in user plus their staff role.
 *
 * Identity comes from getClaims(), which checks the JWT's signature locally
 * instead of asking Supabase Auth (getUser) on every request. That saves a
 * full network round trip per page, and it is no weaker than before for our
 * data: Postgres row-level security trusts the very same signed JWT on every
 * query. What it does not do is notice a token revoked server-side (e.g. a
 * banned user) before that token expires, at most an hour later.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: claims.email ?? "",
    role: (profile?.role as StaffRole | undefined) ?? null,
  };
});

/**
 * Call at the top of every admin page and Server Action. Layouts do not
 * re-run on client navigation, and Server Actions are public endpoints, so
 * the check has to sit next to the data access, not only in a layout.
 * Row-level security in Postgres remains the final gate.
 */
export async function requireStaff(): Promise<Staff> {
  const session = await getSession();
  if (!session || !session.role) redirect("/login");
  return { ...session, role: session.role };
}
