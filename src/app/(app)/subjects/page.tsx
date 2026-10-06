import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { listSubjectsWithStats } from "@/server/services/subjects";
import { SubjectForm } from "@/components/subject-form";

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions);
  const subjects = await listSubjectsWithStats(session!.user.id);
  return (
    <>
      <h1 className="text-2xl font-semibold">Subjects</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {subjects.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted sm:col-span-2">No subjects yet. Add your first one.</p>}
          {subjects.map((s) => (
            <Link key={s.id} href={`/subjects/${s.id}`} className="rounded-2xl border border-line bg-card p-4 transition hover:border-brand" style={{ borderTop: `4px solid ${s.color}` }}>
              <p className="font-medium">{s.icon} {s.name}</p>
              <p className="text-xs text-muted">{[s.teacher, s.classroom].filter(Boolean).join(" · ") || "No teacher or room"}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={s.percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full" style={{ width: `${s.percent}%`, background: s.color }} /></div>
              <p className="mt-1 text-xs text-muted">{s.completed}/{s.total} done · {s.percent}%</p>
            </Link>
          ))}
        </div>
        <SubjectForm />
      </div>
    </>
  );
}
