"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import Leaderboard from "@/components/Leaderboard";
import type { Player } from "@/lib/types";

export default function LeaderboardsClient({ players }: { players: Player[] }) {
  const [tab, setTab] = useState<"money" | "playtime" | "kills" | "deaths">("money");
  return (
    <div>
      <Tabs
        aria-label="Leaderboard category"
        selectedKey={tab}
        onSelectionChange={(k) => setTab(k as typeof tab)}
        color="primary"
        variant="bordered"
        className="mb-5"
      >
        <Tab key="money" title="Money" />
        <Tab key="playtime" title="Playtime" />
        <Tab key="kills" title="Kills" />
        <Tab key="deaths" title="Deaths" />
      </Tabs>
      <Leaderboard players={players} initial={tab} />
    </div>
  );
}
