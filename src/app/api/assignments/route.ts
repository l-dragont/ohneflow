import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { guard, bad } from "@/server/http";
import { createDefaultReminder } from "@/server/services/reminders";
import { assignmentSchema } from "@/server/validation";

// GET /api/assignments?subjectId=&status=&sort=due|priority|status
export async function GET(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const q = new URL(req.url).searchParams;
  const where: Prisma.AssignmentWhereInput = { userId: g.uid };
  if (q.get("subjectId")) where.subjectId = q.get("subjectId")!;
  const status = q.get("status");
  if (status === "NOT_STARTED" || status === "IN_PROGRESS" || status === "COMPLETED") where.status = status;
  const sort = q.get("sort");
  const orderBy: Prisma.AssignmentOrderByWithRelationInput =
    sort === "priority" ? { priority: "desc" } : sort === "status" ? { status: "asc" } : { dueDate: "asc" };
  const items = await db.assignment.findMany({ where, orderBy, include: { subject: { select: { id: true, name: true, color: true, icon: true } } } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const parsed = assignmentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  // The subject must belong to this user (prevents attaching work to someone else's subject).
  const subject = await db.subject.findFirst({ where: { id: parsed.data.subjectId, userId: g.uid } });
  if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 400 });
  const completedAt = parsed.data.status === "COMPLETED" ? new Date() : null;
  const a = await db.assignment.create({ data: { ...parsed.data, userId: g.uid, completedAt } });
  await createDefaultReminder(a.id, a.dueDate);
  return NextResponse.json(a, { status: 201 });
}
