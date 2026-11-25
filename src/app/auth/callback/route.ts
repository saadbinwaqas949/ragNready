import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/storefront/safe-path";

/** Google sends the customer back here; exchange the code for a session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Behind a proxy the request URL can carry the internal host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = process.env.NODE_ENV === "production" && forwardedHost && !forwardedHost.startsWith("localhost") ? `https://${forwardedHost}` : url.origin;
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    } catch { /* handled below */ }
  }
  return NextResponse.redirect(new URL("/account?error=signin", origin));
}
