"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Bot, Clock, ExternalLink, Gauge, Tag, User } from "lucide-react";
import StatCard from "@/components/StatCard";
import { siteConfig } from "@/config/site";
import { timeAgo } from "@/lib/format";
import type { BotStatus } from "@/lib/data";

function formatUptime(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function BotClient({ initial }: { initial: BotStatus | null }) {
  const [bot, setBot] = useState<BotStatus | null>(initial);
  const [missing, setMissing] = useState(initial === null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/bot/status", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && json.bot) {
          setBot(json.bot);
          setMissing(false);
        } else {
          setMissing(true);
        }
      } catch {
        if (!cancelled) setMissing(true);
      }
    }
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!bot || missing) {
    return (
      <Card shadow="sm" className="border-2 border-black">
        <CardBody className="flex flex-col items-center gap-2 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[2px] border-2 border-black bg-default-300 text-default-600">
            <Bot size={22} aria-hidden />
          </div>
          <p className="font-pixel text-sm">AFK BOT NOT REPORTING</p>
          <p className="max-w-sm text-sm text-default-500">
            The AFK bot has not sent a status report yet. It reports to{" "}
            <code className="rounded bg-default-100 px-1 text-xs">POST /api/bot/status</code> —
            see <code className="rounded bg-default-100 px-1 text-xs">BOT_API.md</code> for the payload format.
          </p>
          {siteConfig.links.botDashboard ? (
            <Button
              as="a"
              href={siteConfig.links.botDashboard}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="flat"
              color="primary"
              endContent={<ExternalLink size={14} aria-hidden />}
            >
              Open bot dashboard
            </Button>
          ) : null}
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card shadow="sm" className="border-2 border-black" role="status" aria-live="polite">
        <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[2px] border-2 border-black bg-emerald-600 text-white">
            <Bot size={22} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-pixel text-sm">MANGOZ AFK BOT</p>
              <Chip size="sm" variant="flat" color={bot.online ? "success" : "danger"}>
                {bot.online ? "Online" : "Offline"}
              </Chip>
              {bot.account ? (
                <Chip size="sm" variant="flat">{bot.account}</Chip>
              ) : null}
              {bot.version ? (
                <Chip size="sm" variant="flat">v{bot.version}</Chip>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-default-500">
              Last report {timeAgo(bot.updatedAt)}
            </p>
          </div>
          {siteConfig.links.botDashboard ? (
            <Button
              as="a"
              href={siteConfig.links.botDashboard}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="flat"
              color="primary"
              endContent={<ExternalLink size={14} aria-hidden />}
            >
              Bot dashboard
            </Button>
          ) : null}
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Uptime" value={formatUptime(bot.uptimeSeconds)} icon={Clock} colorIndex={1} />
        <StatCard
          title="Ping to server"
          value={bot.latencyMs !== undefined ? `${bot.latencyMs} ms` : "—"}
          icon={Gauge}
          colorIndex={2}
        />
        <StatCard title="Bot account" value={bot.account ?? "—"} icon={User} colorIndex={3} />
        <StatCard title="Bot version" value={bot.version ? `v${bot.version}` : "—"} icon={Tag} colorIndex={0} />
      </div>
    </div>
  );
}
