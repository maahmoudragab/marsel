import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only privileged Supabase client for authorized operations.
 * When SUPABASE_SERVICE_ROLE_KEY is set in .env.local, this client bypasses RLS safely on the server.
 */
export function getPrivilegedSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
