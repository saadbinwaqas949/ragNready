import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Defense in depth: every protected admin layout and data action calls this. */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/admin/login");

  const { data: allowed, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || allowed !== true) redirect("/admin/login?unauthorized=1");
  return { supabase, user };
}
