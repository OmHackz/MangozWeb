import type { Metadata } from "next";
import LeaderboardsClient from "./leaderboards-client";
import { PageHeader } from "@/components/Headers";
import { getPlayers } from "@/lib/data";

export const metadata: Metadata = { title: "Leaderboards" };
export const revalidate = 30;

export default async function LeaderboardsPage() {
  const { players } = await getPlayers();
  return (
    <div className="py-10">
      <PageHeader title="Leaderboards" description="Top players by wealth, activity and combat." />
      <LeaderboardsClient players={players} />
    </div>
  );
}
