import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getAdminSiteSettings } from "@/lib/data/admin";

export default async function SiteSettingsPage() {
  const settings = await getAdminSiteSettings();
  return <><div className="admin-page-heading"><div><h1>Site Settings</h1><p>Edit the storefront details and messages without changing code.</p></div></div><SiteSettingsForm settings={settings} /></>;
}
