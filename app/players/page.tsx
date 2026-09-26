import type { Metadata } from "next";
import PlayersClient from "./players-client";
import { PageHeader } from "@/components/Headers";
import { getPlayers } from "@/lib/data";

export const metadata: Metadata = { title: "Players" };
export const revalidate = 30;

export default async function PlayersPage() {
  const { players, live } = await getPlayers();
  return (
    <div className="py-10">
      <PageHeader
        title="Players"
        description={
          live
            ? "Live player data from the MangoZ SMP database."
            : "Showing recent player data. Connect the database for live updates."
        }
      />
      <PlayersClient initial={players} />
    </div>
  );
}
