import { NextResponse } from "next/server";
import { guard } from "@/server/http";
import { rateLimit } from "@/server/security/ratelimit";
import { complete } from "@/server/ai/provider";
import { TUTOR_SYSTEM } from "@/server/ai/prompts";
import { gradeSummary } from "@/server/services/grades";

export async function POST() {
  const g = await guard(); if (g instanceof NextResponse) return g;
  if (!(await rateLimit(`ai:${g.uid}`, 20, 60_000))) return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429 });
  const { perSubject, gpa } = await gradeSummary(g.uid);
  const lines = perSubject.filter((s) => s.avg !== null).map((s) => `- ${s.name}: ${s.avg}% (${s.letter}, ${s.count} grades)`);
  if (!lines.length) return NextResponse.json({ advice: "Add a few grades first and I'll suggest where to focus." });
  try {
    const advice = await complete(TUTOR_SYSTEM, [{ role: "user", content: `Here are my current grades (estimated GPA ${gpa}):\n${lines.join("\n")}\nWhich subjects should I focus on and what 3 concrete habits would help most? Be encouraging and specific.` }], 800);
    return NextResponse.json({ advice });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 }); }
}
