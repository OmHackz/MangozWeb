import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/data";

export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = decodeURIComponent(params.username);
    const { player, live } = await getPlayer(username);
    if (!player) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, player, live },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load player" }, { status: 500 });
  }
}
