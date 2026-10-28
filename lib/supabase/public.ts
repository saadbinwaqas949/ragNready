import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicSupabaseConfig } from "./env";

/** Stateless anonymous client for public, RLS-filtered catalog reads and static generation. */
export function createSupabasePublicClient() {
  const { url, anonKey } = publicSupabaseConfig();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
