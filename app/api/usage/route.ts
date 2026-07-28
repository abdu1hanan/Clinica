import { NextResponse } from "next/server";
import { getTodayUsageStats } from "@/lib/rateLimit";

export async function GET() {
  const stats = await getTodayUsageStats();
  return NextResponse.json(stats);
}
