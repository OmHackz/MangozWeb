import { NextResponse } from "next/server";
import { DbUnavailableError, getStats } from "@/lib/data";

export const revalidate = 0;

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(
      { success: true, stats },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json({ success: false, error: "Unable to load stats" }, { status: code });
  }
}
