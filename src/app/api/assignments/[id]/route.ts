import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard, bad, notFound } from "@/server/http";
import { awardBadges } from "@/server/services/gamification";
import { syncReminders } from "@/server/services/reminders";
import { assignmentSchema } from "@/server/validation";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const parsed = assignmentSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.subjectId) {
    const s = await db.subject.findFirst({ where: { id: parsed.data.subjectId, userId: g.uid } });
    if (!s) return NextResponse.json({ error: "Subject not found" }, { status: 400 });
  }
  if (parsed.data.status) data.completedAt = parsed.data.status === "COMPLETED" ? new Date() : null;
  const r = await db.assignment.updateMany({ where: { id: params.id, userId: g.uid }, data });
  if (r.count && parsed.data.dueDate !== undefined) await syncReminders(params.id, parsed.data.dueDate);
  if (r.count && parsed.data.status === "COMPLETED") await awardBadges(g.uid);
  return r.count ? NextResponse.json({ ok: true }) : notFound();
}

export async function DELETE(_: Request, { params }: Ctx) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const r = await db.assignment.deleteMany({ where: { id: params.id, userId: g.uid } });
  return r.count ? NextResponse.json({ ok: true }) : notFound();
}
