import { metadata } from "./metadata";
import { getBusinessSettings } from "@/lib/admin/settings";
import { AdminSettingsContent } from "./content";

export { metadata };

export default async function AdminSettingsPage() {
  const result = await getBusinessSettings();
  const settings = result.ok ? result.data : null;

  return <AdminSettingsContent initialSettings={settings} />;
}