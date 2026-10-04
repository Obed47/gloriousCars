import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Display only: every admin page and action re-checks access itself.
  const staff = await requireStaff();

  return (
    <div className="pb-24">
      <div className="border-b border-line bg-surface">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <nav aria-label="Admin" className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/admin" className="text-ink hover:text-accent">
              Vehicles
            </Link>
            <Link href="/admin/vehicles/new" className="text-ink hover:text-accent">
              Add vehicle
            </Link>
            <Link href="/" className="text-muted hover:text-ink">
              View site
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">
              {staff.email} · <span className="capitalize">{staff.role}</span>
            </span>
            <form action={logout}>
              <button type="submit" className="font-semibold text-ink hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="wrap pt-10">{children}</div>
    </div>
  );
}
