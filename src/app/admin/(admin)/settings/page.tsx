import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata = {
  title: "Settings",
};

export default function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure business details and admin preferences."
      comingSoonDescription="Settings have not been built yet. They will be added in a future step of the project."
      icon={<Settings className="size-8 text-muted-foreground" />}
    />
  );
}