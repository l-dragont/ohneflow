import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { getSubjectDashboard } from "@/server/services/subjects";
import { AssignmentList } from "@/components/assignment-list";
import { AssignmentForm } from "@/components/assignment-form";
import { AiChat } from "@/components/ai-chat";
import { SubjectActions } from "@/components/subject-actions";

export default async function SubjectDashboard({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const data = await getSubjectDashboard(session!.user.id, params.id);
  if (!data) notFound();
  const { subject, assignments, stats, recommendations } = data;
  const items = assignments.map((a) => ({ ...a, dueDate: a.dueDate?.toISOString() ?? null }));
  const hours = (stats.remainingMinutes / 60).toFixed(1);
  const tiles: [string, string][] = [
    ["Completion", `${stats.percent}%`], ["Done", `${stats.completed}/${stats.total}`],
    ["Due this week", String(stats.upcomingCount)], ["Overdue", String(stats.overdueCount)], ["Study time left", `${hours} h`],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{subject.icon} {subject.name}</h1>
        <p className="text-sm text-muted">{[subject.teacher, subject.classroom].filter(Boolean).join(" · ")}</p>
      </div>
      <SubjectActions subject={subject} total={stats.total} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-card p-3"><p className="text-xs text-muted">{k}</p><p className="text-xl font-semibold">{v}</p></div>)}
      </div>
      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="font-medium">Study recommendations</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
      <AiChat subjectId={subject.id} subjectName={subject.name} />
      <section><h2 className="mb-2 font-medium">Assignments</h2>
        <AssignmentList items={items} subjects={[{ id: subject.id, name: subject.name, icon: subject.icon }]} showSubject={false} /></section>
      <section><h2 className="mb-2 font-medium">Add assignment</h2>
        <AssignmentForm subjects={[{ id: subject.id, name: subject.name, icon: subject.icon }]} defaultSubjectId={subject.id} /></section>
    </div>
  );
}
