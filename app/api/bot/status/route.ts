import { NextResponse } from "next/server";
import {
  DbUnavailableError,
  getBotStatus,
  recordHeartbeat,
  setBotStatus,
} from "@/lib/data";
import { requireBotAuth, validateBotPayload } from "@/lib/validation";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const revalidate = 0;

export async function GET() {
  try {
    const status = await getBotStatus();
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Bot has not reported yet" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: true, bot: status },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } }
    );
  } catch (err) {
    const code = err instanceof DbUnavailableError ? 503 : 500;
    return NextResponse.json(
      { success: false, error: "Bot status unavailable" },
      { status: code }
    );
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(`bot:${clientKey(req)}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
  }
  if (!process.env.BOT_API_KEY && !process.env.MINECRAFT_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Server not configured (BOT_API_KEY missing)" },
      { status: 503 }
    );
  }
  if (!requireBotAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 8_000) {
      return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
    }
    body = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const v = validateBotPayload(body);
  if (!v.ok || !v.data) {
    return NextResponse.json({ success: false, error: v.error }, { status: 400 });
  }
  try {
    const status = await setBotStatus(v.data);
    await recordHeartbeat({ service: "bot", online: v.data.online });
    return NextResponse.json({ success: true, bot: status });
  } catch (err) {
    if (err instanceof DbUnavailableError) {
      return NextResponse.json(
        { success: false, error: "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }
    throw err;
  }
}
