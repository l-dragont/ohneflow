"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    const res = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    setBusy(false);
    if (res?.error) setError("Incorrect email or password.");
    else router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <form onSubmit={onSubmit} className="fade-in w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <label className="block text-sm">Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-line bg-bg p-2" />
        </label>
        <label className="block text-sm">Password
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-line bg-bg p-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-brand p-2 font-medium text-white disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-sm"><Link href="/forgot" className="text-brand underline">Forgot password?</Link></p>
        <p className="text-center text-sm text-muted">New here? <Link href="/register" className="text-brand underline">Create an account</Link></p>
      </form>
    </main>
  );
}
