import { NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/** For an uptime monitor: checks the database for real, which also counts as activity on it. */
export async function GET() {
  try {
    const { error } = await createSupabasePublicClient().from("site_settings").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
