"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const router = useRouter();
  return <button className="admin-plain-button" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); router.replace("/admin/login"); router.refresh(); }}>Sign out</button>;
}
