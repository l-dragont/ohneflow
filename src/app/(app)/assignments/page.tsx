import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { AssignmentList } from "@/components/assignment-list";
import { AssignmentForm } from "@/components/assignment-form";

export default async function AssignmentsPage() {
  const uid = (await getServerSession(authOptions))!.user.id;
  const [subjects, assignments] = await Promise.all([
    db.subject.findMany({ where: { userId: uid }, orderBy: { name: "asc" }, select: { id: true, name: true, icon: true, color: true } }),
    db.assignment.findMany({ where: { userId: uid }, include: { subject: { select: { name: true, color: true, icon: true } } } }),
  ]);
  const items = assignments.map((a) => ({ ...a, dueDate: a.dueDate?.toISOString() ?? null }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Assignments</h1>
      {subjects.length === 0
        ? <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">Create a subject first, then add assignments to it.</p>
        : <AssignmentForm subjects={subjects} />}
      <AssignmentList items={items} subjects={subjects} />
    </div>
  );
}
