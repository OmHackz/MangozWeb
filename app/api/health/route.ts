import { NextResponse } from "next/server";
import { isLive } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    success: true,
    api: "ok",
    db: isLive() ? "live" : "demo",
    time: new Date().toISOString(),
  });
}
