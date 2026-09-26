import type { Metadata } from "next";
import LeaderboardsClient from "./leaderboards-client";
import { PageHeader } from "@/components/Headers";
import { EmptyState, ErrorState } from "@/components/States";
import { getPlayers } from "@/lib/data";

export const metadata: Metadata = { title: "Leaderboards" };
export const revalidate = 30;

export default async function LeaderboardsPage() {
  const players = await getPlayers().catch(() => null);

  if (players === null) {
    return (
      <div className="py-10">
        <PageHeader title="Leaderboards" description="Top players by wealth, activity and combat." />
        <ErrorState
          title="Unable to load leaderboards"
          description="The website cannot reach its database. If you are a server owner, check the database configuration and try again."
        />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="py-10">
        <PageHeader title="Leaderboards" description="Top players by wealth, activity and combat." />
        <EmptyState
          title="No leaderboard data yet"
          description="Rankings appear here automatically once player data has been synced from the Minecraft server."
        />
      </div>
    );
  }

  return (
    <div className="py-10">
      <PageHeader title="Leaderboards" description="Top players by wealth, activity and combat." />
      <LeaderboardsClient players={players} />
    </div>
  );
}
