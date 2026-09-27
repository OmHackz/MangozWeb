import { NextResponse } from "next/server";
import { getAnnouncements } from "@/lib/data";
import { defaultNews } from "@/config/news";

export const revalidate = 0;

export async function GET() {
  try {
    const items = await getAnnouncements();
    if (items.length > 0) {
      return NextResponse.json(
        { success: true, items, live: true },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
      );
    }
  } catch {
    // fall through to built-in news
  }
  return NextResponse.json(
    { success: true, items: defaultNews, live: false },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
