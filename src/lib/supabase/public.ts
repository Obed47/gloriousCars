import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Cookie-less client for public catalogue reads. It never touches request
 * cookies, so it is safe during static generation (build, ISR,
 * generateStaticParams, sitemap). Row-level security limits it to what an
 * anonymous visitor may see.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
