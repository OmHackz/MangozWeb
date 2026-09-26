import { NextResponse } from "next/server";
import { DbUnavailableError, getServerStatus } from "@/lib/data";

export const revalidate = 0;

export async function GET() {
  try {
    const status = await getServerStatus();
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: true, status },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json(
      { success: false, error: "Status unavailable" },
      { status: code }
    );
  }
}
