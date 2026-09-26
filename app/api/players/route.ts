import { NextResponse } from "next/server";
import { DbUnavailableError, getPlayers } from "@/lib/data";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const onlineOnly = url.searchParams.get("online") === "true";
    const players = await getPlayers();
    let out = players;
    if (onlineOnly) out = out.filter((p) => p.online);
    if (search) out = out.filter((p) => p.username.toLowerCase().includes(search));
    return NextResponse.json(
      { success: true, players: out.slice(0, 500) },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json({ success: false, error: "Unable to load players" }, { status: code });
  }
}
