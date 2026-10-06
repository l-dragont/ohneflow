import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard, bad } from "@/server/http";
import { rateLimit } from "@/server/security/ratelimit";
import { complete } from "@/server/ai/provider";
import { TUTOR_SYSTEM } from "@/server/ai/prompts";
import { buildContext } from "@/server/ai/context";

const body = z.object({ message: z.string().trim().min(1).max(2000), subjectId: z.string().nullish(), threadId: z.string().nullish() });

export async function POST(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  if (!(await rateLimit(`ai:${g.uid}`, 20, 60_000))) return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  const { message, subjectId, threadId } = parsed.data;

  let thread = threadId ? await db.aiThread.findFirst({ where: { id: threadId, userId: g.uid } }) : null;
  if (!thread) thread = await db.aiThread.create({ data: { userId: g.uid, subjectId: subjectId ?? null } });
  const history = await db.aiMessage.findMany({ where: { threadId: thread.id }, orderBy: { createdAt: "desc" }, take: 10 });
  const msgs = [...history.reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user" as const, content: message }];

  try {
    const system = `${TUTOR_SYSTEM}\n\n${await buildContext(g.uid, subjectId ?? thread.subjectId)}`;
    const reply = await complete(system, msgs);
    await db.aiMessage.createMany({ data: [{ threadId: thread.id, role: "user", content: message }, { threadId: thread.id, role: "assistant", content: reply }] });
    return NextResponse.json({ threadId: thread.id, reply });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 });
  }
}
