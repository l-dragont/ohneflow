import { NextResponse } from "next/server";
import { guard } from "@/server/http";
import { getAnalytics } from "@/server/services/analytics";

export async function GET() {
  const g = await guard(); if (g instanceof NextResponse) return g;
  return NextResponse.json(await getAnalytics(g.uid));
}
