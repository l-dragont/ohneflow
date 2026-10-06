import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { NotesManager } from "@/components/notes-manager";

export default async function NotesPage() {
  const uid = (await getServerSession(authOptions))!.user.id;
  const [notes, subjects, assignments] = await Promise.all([
    db.note.findMany({ where: { userId: uid }, orderBy: { updatedAt: "desc" }, take: 200 }),
    db.subject.findMany({ where: { userId: uid }, orderBy: { name: "asc" }, select: { id: true, name: true, icon: true } }),
    db.assignment.findMany({ where: { userId: uid }, orderBy: { createdAt: "desc" }, take: 200, select: { id: true, title: true, subjectId: true } }),
  ]);
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Notes</h1><NotesManager notes={notes} subjects={subjects} assignments={assignments} /></div>);
}
