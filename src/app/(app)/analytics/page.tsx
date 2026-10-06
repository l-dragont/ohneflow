import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { getAnalytics } from "@/server/services/analytics";
import { BarChart, LineChart, PieChart } from "@/components/charts";

const hrs = (m: number) => `${(m / 60).toFixed(1)} h`;
const Card = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-line bg-card p-4"><h2 className="font-medium">{title}</h2>
    {note && <p className="text-xs text-muted">{note}</p>}<div className="mt-2">{children}</div></section>);

export default async function AnalyticsPage() {
  const a = await getAnalytics((await getServerSession(authOptions))!.user.id);
  const t = a.totals;
  const tiles: [string, string][] = [["Completed", `${t.completed}/${t.total}`], ["Completion rate", `${t.rate}%`], ["Overdue", String(t.overdue)], ["Study time left", hrs(t.remainingMinutes)]];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-card p-4"><p className="text-xs text-muted">{k}</p><p className="text-2xl font-semibold">{v}</p></div>)}</div>

      {a.heavyDays.length > 0 && <p role="status" className="rounded-xl bg-amber-500/15 p-3 text-sm">Heads up: {a.heavyDays.join(", ")} look heavy (4+ hours of work due). Consider starting those assignments earlier.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Assignments completed" note="Per week, last 8 weeks (productivity trend)"><LineChart title="Assignments completed per week" data={a.completedPerWeek} /></Card>
        <Card title="Upcoming workload" note="Estimated minutes due each day, next 14 days"><BarChart title="Minutes of work due per day" data={a.forecast} suffix="m" /></Card>
        <Card title="Workload by subject" note="Share of remaining estimated time"><PieChart title="Remaining workload by subject" data={a.perSubject.map((s) => ({ label: s.name, value: s.remainingMinutes, color: s.color }))} /></Card>
        <Card title="Completion rate by subject"><BarChart title="Completion percent by subject" data={a.perSubject.map((s) => ({ label: s.name, value: s.percent, color: s.color }))} suffix="%" /></Card>
        <Card title="Grade trend" note={a.gpa !== null ? `Weekly average · estimated GPA ${a.gpa}` : "Weekly average of recorded grades"}><LineChart title="Average grade per week" data={a.gradeTrend} max={100} suffix="%" /></Card>
        <Card title="Subject performance" note="Average grade per subject"><BarChart title="Average grade by subject" data={a.gradesBySubject.map((s) => ({ label: s.name, value: s.avg, color: undefined }))} suffix="%" /></Card>
      </div>

      <Card title="Study time estimates" note="Remaining time per subject. Assignments without an estimate count as 30 min.">
        {a.perSubject.length === 0 ? <p className="text-sm text-muted">Add subjects to see estimates.</p> : (
          <table className="w-full text-left text-sm"><thead className="text-xs text-muted"><tr><th className="py-1">Subject</th><th>Done</th><th>Time left</th></tr></thead>
            <tbody>{a.perSubject.map((s) => (<tr key={s.id} className="border-t border-line"><td className="py-2">{s.icon} {s.name}</td><td>{s.completed}/{s.total}</td>
              <td>{hrs(s.remainingMinutes)}{s.unestimated > 0 && <span className="text-xs text-muted"> ({s.unestimated} unestimated)</span>}</td></tr>))}</tbody></table>)}
      </Card>
      <p className="text-xs text-muted">Weeks and days are counted in UTC, so a late-evening deadline can land on a neighboring day.</p>
    </div>
  );
}
