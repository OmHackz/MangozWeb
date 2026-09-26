import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { ArrowLeft, CalendarDays, Clock, Coins, Skull, Swords, Wallet, Pickaxe, Boxes, Fingerprint } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import StatCard from "@/components/StatCard";
import { ErrorState } from "@/components/States";
import { getPlayer } from "@/lib/data";
import { formatDate, formatDateTime, formatMoney, formatPlaytimeLong, kdRatio, timeAgo } from "@/lib/format";
import { bodyUrl } from "@/lib/minecraft";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return { title: `${decodeURIComponent(params.username)} — Player` };
}

export default async function PlayerProfilePage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  let player = null;
  try {
    player = await getPlayer(username);
  } catch {
    return (
      <div className="py-10">
        <Button as={Link} href="/players" variant="light" size="sm" startContent={<ArrowLeft size={15} aria-hidden />}>
          All players
        </Button>
        <div className="mt-4">
          <ErrorState
            title="Unable to load player"
            description="The website cannot reach its database right now. Please try again later."
          />
        </div>
      </div>
    );
  }
  if (!player) notFound();

  return (
    <div className="py-10">
      <Button as={Link} href="/players" variant="light" size="sm" startContent={<ArrowLeft size={15} aria-hidden />}>
        All players
      </Button>

      <Card shadow="sm" className="mt-4 border border-default-200">
        <CardBody className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bodyUrl(player.username, 128)}
            alt={`${player.username} full body render`}
            width={96}
            height={160}
            className="image-pixelated rounded-xl bg-default-100"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{player.username}</h1>
              <Chip size="sm" variant="flat" color={player.online ? "success" : "default"}>
                {player.online ? "Online" : "Offline"}
              </Chip>
            </div>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-default-500">
              <Fingerprint size={13} aria-hidden /> {player.uuid}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-default-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden /> Joined {formatDate(player.firstJoined)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} aria-hidden /> Last seen {timeAgo(player.lastSeen)} ({formatDateTime(player.lastSeen)})
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <PlayerAvatar username={player.username} size={40} />
              <p className="text-sm text-default-500">K/D ratio <strong className="text-foreground">{kdRatio(player.kills, player.deaths)}</strong></p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Playtime" value={formatPlaytimeLong(player.playtime)} icon={Clock} />
        <StatCard title="Balance" value={formatMoney(player.money)} subtitle="coins" icon={Coins} />
        <StatCard title="Kills" value={player.kills} icon={Swords} animated />
        <StatCard title="Deaths" value={player.deaths} icon={Skull} animated />
        <StatCard title="K/D ratio" value={kdRatio(player.kills, player.deaths)} icon={Wallet} />
        <StatCard title="Blocks broken" value={player.blocksBroken ?? 0} icon={Pickaxe} animated />
        <StatCard title="Blocks placed" value={player.blocksPlaced ?? 0} icon={Boxes} animated />
        <StatCard title="First joined" value={formatDate(player.firstJoined)} icon={CalendarDays} />
      </div>
    </div>
  );
}
