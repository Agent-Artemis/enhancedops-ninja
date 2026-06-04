import { NextRequest, NextResponse } from "next/server";
import { getRecentCalls } from "@/lib/call-log";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
  const calls = await getRecentCalls(Math.min(limit, 100));
  return NextResponse.json({ calls, count: calls.length });
}
