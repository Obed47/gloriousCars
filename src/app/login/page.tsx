import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoginForm } from "./LoginForm";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role) redirect("/admin");

  return (
    <div className="wrap flex flex-col items-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <SectionHeading
          as="h1"
          eyebrow="Staff"
          title="Sign in"
          description="Manage the vehicle catalogue."
        />

        <div className="mt-8">
          {session ? (
            <div className="card flex flex-col gap-4 p-6">
              <p className="text-sm text-ink">
                You are signed in as <strong>{session.email}</strong>, but this
                account does not have staff access.
              </p>
              <p className="text-sm text-muted">
                Ask an administrator to grant your account a staff role, or sign
                in with a different account.
              </p>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-5 text-sm font-semibold text-ink hover:border-ink hover:bg-mist"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
