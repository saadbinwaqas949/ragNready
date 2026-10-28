"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseConfig } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = publicSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
