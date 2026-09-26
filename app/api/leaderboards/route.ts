import { NextResponse } from "next/server";
import { DbUnavailableError, getPlayers } from "@/lib/data";

export const revalidate = 0;

const ALLOWED = new Set(["money", "playtime", "kills", "deaths"]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const by = url.searchParams.get("by") ?? "money";
    if (!ALLOWED.has(by)) {
      return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    }
    const players = await getPlayers();
    const sorted = [...players].sort((a, b) => {
      if (by === "money") return b.money - a.money;
      if (by === "playtime") return b.playtime - a.playtime;
      if (by === "kills") return b.kills - a.kills;
      return b.deaths - a.deaths;
    });
    return NextResponse.json(
      { success: true, by, entries: sorted.slice(0, 50) },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json({ success: false, error: "Unable to load leaderboard" }, { status: code });
  }
}
