import { NextResponse } from "next/server";
import { getPlayers } from "@/lib/data";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const onlineOnly = url.searchParams.get("online") === "true";
    const { players, live } = await getPlayers();
    let out = players;
    if (onlineOnly) out = out.filter((p) => p.online);
    if (search) out = out.filter((p) => p.username.toLowerCase().includes(search));
    return NextResponse.json(
      { success: true, players: out.slice(0, 200), live },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load players" }, { status: 500 });
  }
}
