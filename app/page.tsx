import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody, Chip } from "@heroui/react";
import {
  Users,
  Server,
  Map as MapIcon,
  Trophy,
  Play,
  Compass,
  Coins,
  Shield,
  Store,
  CalendarDays,
  Gamepad2,
  Puzzle,
  AlertTriangle,
} from "lucide-react";
import ServerStatusCard from "@/components/ServerStatus";
import ServerAddress from "@/components/ServerAddress";
import StatCard from "@/components/StatCard";
import PlayerCard from "@/components/PlayerCard";
import AsciiCraft from "@/components/AsciiCraft";
import McButton from "@/components/McButton";
import { FadeUp, FadeIn } from "@/components/Motion";
import { serverConfig } from "@/config/server";
import { siteConfig } from "@/config/site";
import { getPlayers, getServerStatus, getStats } from "@/lib/data";
import HeroCopyIp from "./hero-copy";
import HeroLogo from "./hero-logo";

export const metadata: Metadata = {
  title: "MangoZ SMP — Minecraft Survival Server",
  description: siteConfig.description,
};

export const revalidate = 30;

const featureIcons: Record<string, typeof Coins> = {
  Coins,
  Puzzle,
  Store,
  Shield,
  CalendarDays,
  Gamepad2,
  Map: MapIcon,
  Users,
};

export default async function HomePage() {
  const [players, status, stats] = await Promise.all([
    getPlayers().catch(() => null),
    getServerStatus().catch(() => null),
    getStats().catch(() => null),
  ]);
  const onlinePlayers = (players ?? []).filter((p) => p.online).slice(0, 4);
  const dbDown = players === null && status === null && stats === null;

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2px] border-2 border-black bg-gradient-to-b from-primary-50/80 to-background px-6 py-14 dark:from-primary-900/10 sm:px-12 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <FadeIn>
              <Chip color="primary" variant="flat" startContent={<span className="h-2 w-2 rounded-full bg-success" aria-hidden />}>
                {status?.online ? `${status.playersOnline} players online` : "Server status"}
              </Chip>
            </FadeIn>
            <FadeUp delay={0.05}>
              <HeroLogo />
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="mt-3 font-pixel text-xs text-default-600 sm:text-sm">
                {siteConfig.tagline}
              </p>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p className="mt-4 max-w-xl text-default-500">
                A community-driven Minecraft survival server with custom gameplay,
                economy, events, and a connected player experience.
              </p>
            </FadeUp>
            <FadeUp delay={0.24} className="mt-7 flex flex-wrap gap-3">
              <McButton as={Link} href="/server" variant="grass" size="lg" startContent={<Play size={16} aria-hidden />}>
                Play Now
              </McButton>
              <McButton as={Link} href="/store" variant="mango" size="lg" startContent={<Coins size={16} aria-hidden />}>
                Store
              </McButton>
              <McButton as={Link} href="/server" size="lg" startContent={<Compass size={16} aria-hidden />}>
                Explore Server
              </McButton>
            </FadeUp>
            <FadeUp delay={0.3} className="mt-7">
              <HeroCopyIp />
            </FadeUp>
          </div>
          <div className="space-y-4">
            <FadeIn delay={0.25}>
              <ServerStatusCard />
            </FadeIn>
            <FadeIn delay={0.32}>
              <AsciiCraft />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Connection strip */}
      <section className="mt-4" aria-label="Connection addresses">
        <ServerAddress />
      </section>

      {/* Quick stats */}
      {dbDown ? (
        <Card shadow="sm" className="mt-8 border-2 border-black bg-warning-50 dark:bg-warning-900/10">
          <CardBody className="flex flex-row items-center gap-3 p-5">
            <AlertTriangle size={20} className="shrink-0 text-warning-600" aria-hidden />
            <div className="text-sm">
              <p className="font-pixel text-xs">LIVE DATA UNAVAILABLE</p>
              <p className="text-default-600">
                The website cannot reach its database yet. Server owners: set
                SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then redeploy.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Server highlights">
          <StatCard title="Players online" value={status?.playersOnline ?? 0} subtitle={`of ${status?.playersMax ?? 100} slots`} icon={Users} animated colorIndex={1} />
          <StatCard title="Total players" value={stats?.totalPlayers ?? 0} icon={Users} animated colorIndex={2} />
          <StatCard title="Server version" value={status?.version ?? "Unknown"} subtitle="Java + Bedrock" icon={Server} colorIndex={5} />
          <StatCard title="Coins in circulation" value={stats ? stats.totalMoney.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"} icon={Coins} colorIndex={0} />
        </section>
      )}

      {/* Online now */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-pixel text-sm tracking-tight">ONLINE NOW</h2>
          <McButton as={Link} href="/players" size="sm">
            View all players
          </McButton>
        </div>
        {onlinePlayers.length === 0 ? (
          <Card shadow="sm" className="border-2 border-black">
            <CardBody className="p-6 text-sm text-default-500">
              No players are online right now. Check back soon.
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {onlinePlayers.map((p) => (
              <PlayerCard key={p.uuid} player={p} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mt-12">
        <h2 className="font-pixel text-sm tracking-tight">WHY MANGOZ SMP</h2>
        <p className="mt-1 text-sm text-default-500">Survival done right — fair, friendly and full of things to do.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serverConfig.features.map((f, i) => {
            const Icon = featureIcons[f.icon] ?? Coins;
            return (
              <Card key={f.key} shadow="sm" className="border-2 border-black">
                <CardBody className="p-5">
                  <StatIcon index={i} Icon={Icon} />
                  <p className="mt-3 font-pixel text-xs">{f.title.toUpperCase()}</p>
                  <p className="mt-1 text-sm text-default-500">{f.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card shadow="sm" className="border-2 border-black">
          <CardBody className="p-6">
            <Users size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-pixel text-xs">MEET THE PLAYERS</p>
            <p className="mt-1 text-sm text-default-500">Browse profiles, playtime and balances.</p>
            <McButton as={Link} href="/players" size="sm" className="mt-4">
              Players
            </McButton>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border-2 border-black">
          <CardBody className="p-6">
            <MapIcon size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-pixel text-xs">EXPLORE THE MAP</p>
            <p className="mt-1 text-sm text-default-500">See the world and plan your next build.</p>
            <McButton as={Link} href="/map" size="sm" className="mt-4">
              Open map
            </McButton>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border-2 border-black">
          <CardBody className="p-6">
            <Trophy size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-pixel text-xs">CLIMB THE RANKS</p>
            <p className="mt-1 text-sm text-default-500">Richest, most active and top fighters.</p>
            <McButton as={Link} href="/leaderboards" size="sm" className="mt-4">
              Leaderboards
            </McButton>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

const ICON_BG = [
  "bg-amber-500",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-orange-600",
  "bg-teal-600",
  "bg-indigo-600",
];

function StatIcon({ index, Icon }: { index: number; Icon: typeof Coins }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-[2px] border-2 border-black text-white ${ICON_BG[index % ICON_BG.length]}`}>
      <Icon size={19} aria-hidden />
    </div>
  );
}
