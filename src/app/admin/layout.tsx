export const metadata = {
  title: {
    default: "Admin",
    template: "%s | Sanoori Trading Admin",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

/**
 * Shared shell for the private /admin area.
 *
 * The auth gate lives one level deeper in `(admin)/layout.tsx` so that the
 * public-style login page at `/admin/login` is not trapped in a redirect loop.
 * Everything under /admin carries robots "noindex" so private pages are never
 * indexed by search engines.
 */
export default function AdminRootLayout({
  children,
}: LayoutProps<"/admin">) {
  return <>{children}</>;
}