import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import "../admin.css";

export const metadata: Metadata = { title: "Admin login | ragNready", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ setup?: string; unauthorized?: string }> }) {
  const params = await searchParams;
  const message = params.setup ? "Supabase is not configured yet. Add the project values and run the database setup." : params.unauthorized ? "This account does not have ragNready admin access." : "Sign in with your shop administrator account.";
  return <main className="admin-login-screen"><section className="admin-login-card"><div className="admin-brand">rag<span>N</span>ready</div><h1>Welcome back</h1><p>{message}</p><AdminLoginForm /></section></main>;
}
