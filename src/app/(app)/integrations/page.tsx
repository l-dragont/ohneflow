import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { GoogleCard } from "@/components/google-card";
import { JupiterProvider } from "@/server/integrations/grades/provider";

export default async function IntegrationsPage({ searchParams }: { searchParams: { google?: string } }) {
  const uid = (await getServerSession(authOptions))!.user.id;
  const c = await db.googleClassroomConnection.findUnique({ where: { userId: uid }, select: { googleAccountEmail: true, syncStatus: true, lastSyncedAt: true, lastError: true } });
  const status = { connected: !!c, email: c?.googleAccountEmail, syncStatus: c?.syncStatus, lastSyncedAt: c?.lastSyncedAt?.toISOString() ?? null, lastError: c?.lastError };
  const note = { connected: "Google Classroom connected.", denied: "No problem: nothing was connected.", error: "Couldn't connect. Please try again." }[searchParams.google ?? ""];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      {note && <p role="status" className="rounded-xl bg-brand/10 p-3 text-sm">{note}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <GoogleCard status={status} />
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-medium">JupiterEd</h2>
          <p className="mt-2 text-sm text-muted">{JupiterProvider.available() ? "Official integration is configured." : "No official JupiterEd connection is available yet, so ohneflow doesn't ask for your school login. Use manual entry or CSV import instead. It gives you the same GPA estimates and grade advice."}</p>
          <Link href="/grades" className="mt-3 inline-block text-sm text-brand">Go to Grades →</Link>
        </section>
      </div>
    </div>
  );
}
