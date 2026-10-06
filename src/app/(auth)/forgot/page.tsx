"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [sent, setSent] = useState(false); const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: new FormData(e.currentTarget).get("email") }) });
    if (res.ok) setSent(true); else setError((await res.json()).error ?? "Something went wrong.");
  }
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="fade-in w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-6">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        {sent ? <p role="status" className="text-sm">If that email has an account, a reset link is on its way. It works for 1 hour.</p> : <>
          <label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-line bg-bg p-2" /></label>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button className="w-full rounded-lg bg-brand p-2 font-medium text-white">Send reset link</button></>}
        <p className="text-center text-sm"><Link href="/login" className="text-brand underline">Back to sign in</Link></p>
      </form>
    </main>
  );
}
