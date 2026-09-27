import type { Metadata } from "next";
import { Activity, Boxes, Clock, Coins, Pickaxe, Skull, Swords, Users, Wifi } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/Headers";
import StatCard from "@/components/StatCard";
import { ErrorState } from "@/components/States";
import { getStats } from "@/lib/data";
import { formatMoney, formatNumber, formatPlaytimeLong } from "@/lib/format";

export const metadata: Metadata = { title: "Stats" };
export const revalidate = 30;

export default async function StatsPage() {
  const stats = await getStats().catch(() => null);

  if (!stats) {
    return (
      <div className="py-10">
        <PageHeader title="Server stats" description="Aggregate statistics from the MangoZ SMP server." />
        <ErrorState
          title="Unable to load stats"
          description="The website cannot reach its database. If you are a server owner, check the database configuration and try again."
        />
      </div>
    );
  }

  return (
    <div className="py-10">
      <PageHeader
        title="Server stats"
        description="Live aggregate statistics from real player data."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total players" value={stats.totalPlayers} icon={Users} colorIndex={0} animated />
        <StatCard title="Online now" value={stats.onlinePlayers} icon={Wifi} colorIndex={1} animated />
        <StatCard title="Total playtime" value={formatPlaytimeLong(stats.totalPlaytime)} subtitle={`${formatNumber(stats.totalPlaytime)} seconds`} icon={Clock} colorIndex={2} />
        <StatCard title="Coins in circulation" value={formatMoney(stats.totalMoney)} icon={Coins} colorIndex={3} />
        <StatCard title="Total kills" value={stats.totalKills} icon={Swords} colorIndex={4} animated />
        <StatCard title="Total deaths" value={stats.totalDeaths} icon={Skull} colorIndex={5} animated />
        <StatCard title="Blocks broken" value={stats.totalBlocksBroken} icon={Pickaxe} colorIndex={6} animated />
        <StatCard title="Blocks placed" value={stats.totalBlocksPlaced} icon={Boxes} colorIndex={7} animated />
      </div>

      <div className="mt-8">
        <SectionHeader title="Activity snapshot" description="Simple breakdowns — no decorative charts." />
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Kills vs deaths"
            value={`${formatNumber(stats.totalKills)} / ${formatNumber(stats.totalDeaths)}`}
            subtitle={`Ratio ${(stats.totalDeaths === 0 ? stats.totalKills : stats.totalKills / stats.totalDeaths).toFixed(2)}`}
            icon={Activity}
            colorIndex={4}
          />
          <StatCard
            title="Blocks broken vs placed"
            value={`${formatNumber(stats.totalBlocksBroken)} / ${formatNumber(stats.totalBlocksPlaced)}`}
            subtitle="Across all tracked players"
            icon={Boxes} colorIndex={7}
          />
        </div>
      </div>
    </div>
  );
}
