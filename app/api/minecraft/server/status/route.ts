import { NextResponse } from "next/server";
import { DbUnavailableError, setServerStatus } from "@/lib/data";
import { requireMinecraftAuth, validateStatusPayload } from "@/lib/validation";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`mc:${clientKey(req)}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
  }
  if (!process.env.MINECRAFT_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Server not configured (MINECRAFT_API_KEY missing)" },
      { status: 503 }
    );
  }
  if (!requireMinecraftAuth(req)) {
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
  const v = validateStatusPayload(body);
  if (!v.ok || !v.data) {
    return NextResponse.json({ success: false, error: v.error }, { status: 400 });
  }
  const status = await setServerStatus(v.data).catch((err) => {
    if (err instanceof DbUnavailableError) return null;
    throw err;
  });
  if (!status) {
    return NextResponse.json(
      { success: false, error: "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }
  return NextResponse.json({ success: true, status });
}
