import { NextResponse } from "next/server";
import { getServerStatus } from "@/lib/data";

export const revalidate = 0;

export async function GET() {
  try {
    const { status, live } = await getServerStatus();
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: true, status, live },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Status unavailable" },
      { status: 503 }
    );
  }
}
