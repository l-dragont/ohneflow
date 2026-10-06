import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { getStudyStats } from "@/server/services/gamification";
import { Pomodoro } from "@/components/pomodoro";
import { BarChart } from "@/components/charts";

export default async function StudyPage() {
  const uid = (await getServerSession(authOptions))!.user.id;
  const [stats, subjects] = await Promise.all([getStudyStats(uid), db.subject.findMany({ where: { userId: uid }, orderBy: { name: "asc" }, select: { id: true, name: true, icon: true } })]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Study tools</h1>
      <p className="rounded-xl bg-brand/10 p-3 text-sm">{stats.message}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Pomodoro subjects={subjects} />
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[["Streak", `${stats.streak} 🔥`], ["Best streak", String(stats.longest)], ["Today", `${stats.todayMinutes} min`]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-card p-3"><p className="text-xs text-muted">{k}</p><p className="text-xl font-semibold">{v}</p></div>))}
          </div>
          <section className="rounded-2xl border border-line bg-card p-4"><h2 className="font-medium">Study minutes, last 7 days</h2>
            <BarChart title="Study minutes per day" data={stats.week} suffix="m" /></section>
        </div>
      </div>
      <section><h2 className="mb-2 font-medium">Achievement badges</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.badges.map((b) => (
          <li key={b.key} className={`rounded-2xl border p-4 ${b.earned ? "border-brand bg-brand/10" : "border-line bg-card opacity-60"}`}>
            <p className="text-2xl" aria-hidden>{b.earned ? "🏅" : "🔒"}</p><p className="font-medium">{b.name}</p><p className="text-xs text-muted">{b.description}</p>
            <span className="sr-only">{b.earned ? "Earned" : "Locked"}</span></li>))}</ul></section>
    </div>
  );
}
