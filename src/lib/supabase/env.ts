// NEXT_PUBLIC_* values are inlined into browser bundles at build time, but only
// where they are written out literally as `process.env.NEXT_PUBLIC_X`. A
// dynamic lookup such as `process.env[name]` is NOT inlined, so it works on
// the server yet is `undefined` in the browser. Keep these references literal.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export function getSupabaseEnv() {
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your environment before using Supabase.",
    );
  }
  if (!anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to your environment before using Supabase.",
    );
  }
  return { url, anonKey };
}
