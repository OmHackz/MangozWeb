import type { Metadata } from "next";
import PlayersClient from "./players-client";
import { PageHeader } from "@/components/Headers";
import { ErrorState } from "@/components/States";
import { getPlayers } from "@/lib/data";
import type { Player } from "@/lib/types";

export const metadata: Metadata = { title: "Players" };
export const revalidate = 30;

export default async function PlayersPage() {
  let players: Player[] | null = null;
  try {
    players = await getPlayers();
  } catch {
    players = null;
  }

  if (players === null) {
    return (
      <div className="py-10">
        <PageHeader title="Players" description="Player profiles for MangoZ SMP." />
        <ErrorState
          title="Unable to load players"
          description="The website cannot reach its database. If you are a server owner, check the database configuration and try again."
        />
      </div>
    );
  }

  return (
    <div className="py-10">
      <PageHeader
        title="Players"
        description="Live player data from the MangoZ SMP server."
      />
      <PlayersClient initial={players} />
    </div>
  );
}
