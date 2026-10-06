import { createHash } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { bad } from "@/server/http";
import { rateLimit } from "@/server/security/ratelimit";

const body = z.object({ token: z.string().min(10).max(200), password: z.string().min(10, "Use at least 10 characters").max(128) });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`reset:${ip}`, 10, 15 * 60_000))) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const p = body.safeParse(await req.json().catch(() => null));
  if (!p.success) return bad(p.error);
  const rec = await db.passwordResetToken.findUnique({ where: { tokenHash: createHash("sha256").update(p.data.token).digest("hex") } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  await db.user.update({ where: { id: rec.userId }, data: { passwordHash: await bcrypt.hash(p.data.password, 12) } });
  await db.passwordResetToken.deleteMany({ where: { userId: rec.userId } });  // single use
  return NextResponse.json({ ok: true });
}
