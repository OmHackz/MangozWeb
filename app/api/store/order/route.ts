import { NextResponse } from "next/server";
import {
  DbUnavailableError,
  createStoreOrder,
  dbConfigured,
} from "@/lib/data";
import { validateOrderPayload } from "@/lib/validation";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { UPI_ID, storeItems } from "@/config/store";

export const revalidate = 0;

async function notifyWebhook(message: string) {
  const url = process.env.ORDER_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message.slice(0, 1900) }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[store] webhook failed:", err);
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(`store:${clientKey(req)}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
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

  const v = validateOrderPayload(
    body,
    storeItems.map((i) => i.id)
  );
  if (!v.ok || !v.data) {
    return NextResponse.json({ success: false, error: v.error }, { status: 400 });
  }

  // Price comes from the server config — never trust client amounts.
  const item = storeItems.find((i) => i.id === v.data!.itemId)!;

  if (!dbConfigured()) {
    return NextResponse.json({
      success: true,
      persisted: false,
      order: {
        username: v.data.username,
        itemId: item.id,
        itemName: item.name,
        amountInr: item.priceInr,
        utr: v.data.utr,
        status: "pending",
      },
    });
  }

  try {
    const id = await createStoreOrder({
      username: v.data.username,
      itemId: item.id,
      itemName: item.name,
      amountInr: item.priceInr,
      upiId: UPI_ID,
      utr: v.data.utr,
    });
    await notifyWebhook(
      `New MangoZ SMP store order\nRank: ${item.id} (${item.priceInr} INR)\nPlayer: ${v.data.username}\nUTR: ${v.data.utr}\nOrder: ${id}\nVerify the payment, then set status=approved in store_orders and grant the rank in game.`
    );
    return NextResponse.json({
      success: true,
      persisted: true,
      order: {
        id,
        username: v.data.username,
        itemId: item.id,
        itemName: item.name,
        amountInr: item.priceInr,
        utr: v.data.utr,
        status: "pending",
      },
    });
  } catch (err) {
    if (err instanceof DbUnavailableError) {
      return NextResponse.json(
        { success: false, error: "Could not save the order. Please try again later." },
        { status: 503 }
      );
    }
    throw err;
  }
}
