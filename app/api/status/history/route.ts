import { NextResponse } from "next/server";
import { DbUnavailableError, getHeartbeats } from "@/lib/data";

export const revalidate = 0;

export type PillState = "up" | "down" | "partial" | "nodata";

export interface Pill {
  /** Bucket start (ISO). */
  t: string;
  state: PillState;
  /** 0–1 fraction of online reports in the bucket, null when no data. */
  uptime: number | null;
  /** Average players online in the bucket (server only). */
  players: number | null;
}

function clampHours(v: string | null): number {
  const n = parseInt(v ?? "", 10);
  if (Number.isNaN(n)) return 3;
  return Math.min(24, Math.max(1, n));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const service = url.searchParams.get("service") === "bot" ? "bot" : "server";
    const hours = clampHours(url.searchParams.get("hours"));
    const count = Math.min(72, hours * 12); // 5-minute pills
    const sizeMs = (hours * 3600 * 1000) / count;
    const end = Date.now();
    const start = end - hours * 3600 * 1000;

    const rows = await getHeartbeats(service, new Date(start).toISOString());
    const times = rows.map((r) => new Date(r.createdAt).getTime());

    const pills: Pill[] = Array.from({ length: count }, (_, i) => {
      const bStart = start + i * sizeMs;
      const bEnd = bStart + sizeMs;
      let online = 0;
      let total = 0;
      let playerSum = 0;
      let playerN = 0;
      for (let k = 0; k < rows.length; k++) {
        const t = times[k];
        if (t >= bStart && t < bEnd) {
          total++;
          if (rows[k].online) online++;
          if (rows[k].playersOnline !== null) {
            playerSum += rows[k].playersOnline as number;
            playerN++;
          }
        }
      }
      if (total === 0) {
        return {
          t: new Date(bStart).toISOString(),
          state: "nodata" as PillState,
          uptime: null,
          players: null,
        };
      }
      const uptime = online / total;
      return {
        t: new Date(bStart).toISOString(),
        state: (uptime === 1 ? "up" : uptime === 0 ? "down" : "partial") as PillState,
        uptime,
        players: playerN > 0 ? Math.round(playerSum / playerN) : null,
      };
    });

    const withData = pills.filter((p) => p.uptime !== null);
    const uptimePercent =
      withData.length === 0
        ? null
        : (withData.reduce((s, p) => s + (p.uptime as number), 0) / withData.length) * 100;

    return NextResponse.json(
      { success: true, service, hours, pills, uptimePercent },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json({ success: false, error: "Unable to load history" }, { status: code });
  }
}
