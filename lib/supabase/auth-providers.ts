import "server-only";
import { publicSupabaseConfig } from "./env";

/** Reads whether Google sign-in is switched on in Supabase, so the button only appears when it works. */
export async function googleSignInEnabled() {
  try {
    const { url, anonKey } = publicSupabaseConfig();
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey }, next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const settings = await response.json() as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch { return false; }
}
