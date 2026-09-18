import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

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

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-primary font-heading text-base font-bold text-primary-foreground">
                ST
              </div>
              <div className="text-left leading-tight">
                <span className="block font-heading text-lg font-bold tracking-tight text-foreground">
                  Sanoori
                </span>
                <span className="block text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
                  Trading
                </span>
              </div>
            </Link>

            <h1 className="mt-6 font-heading text-xl font-bold tracking-tight text-foreground">
              Admin sign in
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to manage your catalogue and inquiries.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
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