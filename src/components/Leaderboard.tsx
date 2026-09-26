"use client";

import { Card, CardBody } from "@heroui/react";
import type { Player } from "@/lib/types";
import { formatMoney, formatNumber, formatPlaytime } from "@/lib/format";

const TABS = ["money", "playtime", "kills", "deaths"] as const;
type Tab = (typeof TABS)[number];

export default function Leaderboard({
  players,
  initial = "money",
}: {
  players: Player[];
  initial?: Tab;
}) {
  const sorted = [...players].sort((a, b) => {
    switch (initial) {
      case "money":
        return b.money - a.money;
      case "playtime":
        return b.playtime - a.playtime;
      case "kills":
        return b.kills - a.kills;
      case "deaths":
        return b.deaths - a.deaths;
    }
  });

  function value(p: Player): string {
    switch (initial) {
      case "money":
        return formatMoney(p.money);
      case "playtime":
        return formatPlaytime(p.playtime);
      case "kills":
        return formatNumber(p.kills);
      case "deaths":
        return formatNumber(p.deaths);
    }
  }

  return (
    <Card className="border border-default-200" shadow="sm">
      <CardBody className="p-0">
        <ol>
          {sorted.slice(0, 20).map((p, i) => (
            <li
              key={p.uuid}
              className={`flex items-center gap-3 px-5 py-3 ${i !== 0 ? "border-t border-default-100" : ""}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-default-100 text-default-600"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{p.username}</span>
              <span className="text-sm font-semibold tabular-nums">{value(p)}</span>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
