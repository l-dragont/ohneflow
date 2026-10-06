import Link from "next/link";
import { ResetForm } from "@/components/reset-form";

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="fade-in w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-6">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        {searchParams.token ? <ResetForm token={searchParams.token} /> : <p className="text-sm">This link is missing its token. <Link href="/forgot" className="text-brand underline">Request a new one</Link>.</p>}
      </div>
    </main>
  );
}
