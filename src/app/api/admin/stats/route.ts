import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/server/http";

// Example of a role-protected route: only users with role ADMIN get through.
export async function GET() {
  const g = await guardAdmin(); if (g instanceof NextResponse) return g;
  const [users, assignments] = await Promise.all([db.user.count(), db.assignment.count()]);
  return NextResponse.json({ users, assignments });
}
