import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { LocalDate } from "@/components/local-date";
import { effectiveStreak } from "@/server/services/gamification";

const links: [string, string, string][] = [
  ["Calendar", "/calendar", "See deadlines by day, week or month"], ["Grades", "/grades", "Track grades and your GPA"],
  ["Analytics", "/analytics", "Progress, workload and trends"], ["Study timer", "/study", "Pomodoro, streaks and badges"],
];

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.id;
  const now = new Date();
  const open = { userId: uid, status: { not: "COMPLETED" as const } };
  const inc = { subject: { select: { name: true, icon: true } } };
  const [upcoming, overdue, user] = await Promise.all([
    db.assignment.findMany({ where: { ...open, dueDate: { gte: now } }, orderBy: { dueDate: "asc" }, take: 5, include: inc }),
    db.assignment.findMany({ where: { ...open, dueDate: { lt: now } }, orderBy: { dueDate: "asc" }, take: 5, include: inc }),
    db.user.findUniqueOrThrow({ where: { id: uid } }),
  ]);
  const streak = effectiveStreak(user);
  const List = ({ rows, empty }: { rows: typeof upcoming; empty: string }) => rows.length === 0
    ? <p className="mt-2 text-sm text-muted">{empty}</p>
    : <ul className="mt-2 space-y-2 text-sm">{rows.map((a) => (
        <li key={a.id}><p className="font-medium">{a.title}</p>
          <p className="text-xs text-muted">{a.subject.icon} {a.subject.name} · <LocalDate iso={a.dueDate?.toISOString() ?? null} time /></p></li>))}</ul>;
  return (
    <>
      <h1 className="text-2xl font-semibold">Hi, {session?.user.name?.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-muted">{streak > 0 ? `${streak}-day study streak 🔥. ` : ""}Here's what needs your attention.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-line bg-card p-5"><h2 className="font-medium">Upcoming assignments</h2>
          <List rows={upcoming} empty="Nothing due. Add an assignment to get started." />
          <Link href="/assignments" className="mt-3 inline-block text-sm text-brand">Manage assignments →</Link></section>
        <section className="rounded-2xl border border-line bg-card p-5"><h2 className="font-medium text-red-500">Overdue work</h2>
          <List rows={overdue} empty="You're on track. Nothing overdue." /></section>
        {links.map(([t, href, d]) => (
          <Link key={t} href={href} className="rounded-2xl border border-line bg-card p-5 transition hover:border-brand"><h2 className="font-medium">{t}</h2><p className="mt-2 text-sm text-muted">{d}</p></Link>))}
      </div>
    </>
  );
}
