import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { businessConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { cookies } from "next/headers";

export const metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const cookieStore = await cookies();
  const csrfToken = cookieStore.get("authjs.csrf-token")?.value?.split("|")[0] ?? "";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={businessConfig.logo.src}
                alt={businessConfig.logo.alt}
                width={1120}
                height={338}
                unoptimized
                priority
                sizes="168px"
                className="h-9 w-auto max-w-full object-contain"
              />
            </Link>

            <h1 className="mt-6 font-heading text-xl font-bold tracking-tight text-foreground">
              Admin sign in
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to manage your catalogue and inquiries.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm csrfToken={csrfToken} />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Authorized personnel only. Unauthorized access attempts are
            monitored.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            &larr; Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}