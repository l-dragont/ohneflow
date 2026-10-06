import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/server/security/ratelimit";
import { sendEmail } from "@/server/email";

// Always answers the same way so attackers can't discover which emails are registered.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`forgot:${ip}`, 5, 15 * 60_000))) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  const p = z.object({ email: z.string().trim().toLowerCase().email() }).safeParse(await req.json().catch(() => null));
  if (p.success) {
    const user = await db.user.findUnique({ where: { email: p.data.email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 3600_000) } });
      const link = `${process.env.NEXTAUTH_URL ?? new URL(req.url).origin}/reset?token=${token}`;
      if (process.env.NODE_ENV !== "production") console.log("Password reset link:", link);   // dev convenience
      await sendEmail(user.email, "Reset your ohneflow password", `Use this link within 1 hour to choose a new password:\n${link}\n\nIf you didn't ask for this, ignore this email.`);
    }
  }
  return NextResponse.json({ ok: true });
}
