import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";

export const revalidate = 0;

export async function GET() {
  try {
    const { stats, live } = await getStats();
    return NextResponse.json(
      { success: true, stats, live },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load stats" }, { status: 500 });
  }
}
