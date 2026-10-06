import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard, notFound } from "@/server/http";
import { rateLimit } from "@/server/security/ratelimit";
import { complete } from "@/server/ai/provider";
import { TUTOR_SYSTEM } from "@/server/ai/prompts";

const roadmap = z.object({
  firstSteps: z.string(),
  steps: z.array(z.object({ title: z.string(), minutes: z.number(), tip: z.string().optional() })).min(1).max(12),
  totalMinutes: z.number(),
  timeline: z.array(z.object({ day: z.string(), focus: z.string() })).max(14),
});

// POST /api/ai/assignments/:id/roadmap[?refresh=1]  -> "Help Me Start" plan (cached per assignment)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  if (!(await rateLimit(`ai:${g.uid}`, 20, 60_000))) return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429 });
  const a = await db.assignment.findFirst({ where: { id: params.id, userId: g.uid }, include: { subject: true, roadmap: true } });
  if (!a) return notFound();
  if (a.roadmap && !new URL(req.url).searchParams.get("refresh")) return NextResponse.json(a.roadmap);

  const prompt = `Make a start-here roadmap for this assignment. Reply with ONLY JSON:
{"firstSteps": string (2-3 sentences: exactly where to begin, first 10 minutes), "steps":[{"title":string,"minutes":number,"tip":string}], "totalMinutes": number, "timeline":[{"day":string,"focus":string}]}
Subject: ${a.subject.name}
Title: ${a.title}
Instructions: ${a.description ?? "(none given)"}
Due: ${a.dueDate?.toISOString().slice(0, 10) ?? "no date"} (today is ${new Date().toISOString().slice(0, 10)})
Student's own estimate: ${a.estimatedMinutes ?? "none"} min
Guide the student to do the work themselves; do not include answers.`;
  try {
    const text = await complete(TUTOR_SYSTEM, [{ role: "user", content: prompt }], 1500);
    const parsed = roadmap.parse(JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? ""));
    const saved = await db.aiRoadmap.upsert({
      where: { assignmentId: a.id }, create: { assignmentId: a.id, ...parsed }, update: { ...parsed },
    });
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Couldn't build a roadmap right now. Try again in a moment." }, { status: 502 });
  }
}
