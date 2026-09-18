import { MessagesSquare } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata = {
  title: "Inquiries",
};

export default function AdminInquiriesPage() {
  return (
    <PlaceholderPage
      title="Inquiries"
      description="Review and respond to customer quote requests."
      comingSoonDescription="Inquiry management has not been built yet. It will be added in a future step of the project."
      icon={<MessagesSquare className="size-8 text-muted-foreground" />}
    />
  );
}