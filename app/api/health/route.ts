import { NextResponse } from "next/server";
import { dbConfigured, getPlayers, getServerStatus } from "@/lib/data";

export async function GET() {
  const configured = dbConfigured();
  if (!configured) {
    return NextResponse.json({
      success: true,
      api: "ok",
      db: "not_configured",
      hint: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, run supabase/schema.sql, then redeploy.",
      time: new Date().toISOString(),
    });
  }
  try {
    const [players, status] = await Promise.all([getPlayers(), getServerStatus()]);
    return NextResponse.json({
      success: true,
      api: "ok",
      db: "connected",
      players: players.length,
      onlinePlayers: players.filter((p) => p.online).length,
      serverOnline: status?.online ?? null,
      lastStatusUpdate: status?.updatedAt ?? null,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        api: "ok",
        db: "unreachable",
        hint: "Database is configured but could not be reached. Check Supabase project status and RLS policies.",
        time: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
