import type { Metadata } from "next";
import BotClient from "./bot-client";
import { PageHeader } from "@/components/Headers";
import { getBotStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Bot" };
export const revalidate = 30;

export default async function BotPage() {
  const initial = await getBotStatus().catch(() => null);
  return (
    <div className="py-10">
      <PageHeader title="Bot status" description="Live status of the MangoZ AFK bot." />
      <BotClient initial={initial} />
    </div>
  );
}
