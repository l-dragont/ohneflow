import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { Calendar } from "@/components/calendar";

export default async function CalendarPage() {
  const uid = (await getServerSession(authOptions))!.user.id;
  const rows = await db.assignment.findMany({ where: { userId: uid, dueDate: { not: null } }, include: { subject: { select: { color: true, icon: true } } } });
  const items = rows.map((a) => ({ id: a.id, title: a.title, dueDate: a.dueDate!.toISOString(), subjectId: a.subjectId, color: a.subject.color, icon: a.subject.icon, done: a.status === "COMPLETED" }));
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Calendar</h1><Calendar items={items} /></div>);
}
