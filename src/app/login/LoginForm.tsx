"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";

const input =
  "h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          required
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Password</span>
        <input
          required
          name="password"
          type="password"
          autoComplete="current-password"
          className={input}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
