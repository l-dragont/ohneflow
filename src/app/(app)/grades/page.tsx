import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { gradeSummary } from "@/server/services/grades";
import { GradesManager } from "@/components/grades-manager";

export default async function GradesPage() {
  const uid = (await getServerSession(authOptions))!.user.id;
  const { grades, perSubject, gpa } = await gradeSummary(uid);
  const rows = grades.map((g) => ({ ...g, dateRecorded: g.dateRecorded.toISOString() }));
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Grades</h1>
    <GradesManager subjects={perSubject} grades={rows} gpa={gpa} /></div>);
}
