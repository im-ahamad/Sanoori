import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<ReturnType<typeof generatePageMetadata>> {
  return generatePageMetadata({
    title: "Projects", // Not in translation dict yet
    description:
      "Completed projects and installations supplied by Sanoori Trading.",
    path: "/projects",
  });
}

export default async function ProjectsPage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Projects"
        description="A selection of completed projects and installations will be showcased here."
        breadcrumbs={[{ label: "Projects", href: "/projects" }]}
      />
      <Container>
        <div className="section-spacing">
          <EmptyState title="Projects — Coming Soon" />
        </div>
      </Container>
    </main>
  );
}