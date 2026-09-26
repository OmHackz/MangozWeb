"use client";

import { useMemo, useState } from "react";
import { Input, Button, Chip } from "@heroui/react";
import { Search, X } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import { EmptyState } from "@/components/States";
import type { Player } from "@/lib/types";

export default function PlayersClient({ initial }: { initial: Player[] }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<"all" | "online">("all");

  function handleChange(val: string) {
    setQuery(val);
    window.clearTimeout((handleChange as unknown as { t?: number }).t);
    (handleChange as unknown as { t?: number }).t = window.setTimeout(() => {
      setDebounced(val.trim().toLowerCase());
    }, 250);
  }

  const filtered = useMemo(() => {
    return initial.filter((p) => {
      if (filter === "online" && !p.online) return false;
      if (debounced && !p.username.toLowerCase().includes(debounced)) return false;
      return true;
    });
  }, [initial, debounced, filter]);

  const onlineCount = initial.filter((p) => p.online).length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          aria-label="Search players by username"
          placeholder="Search by username…"
          value={query}
          onValueChange={handleChange}
          startContent={<Search size={16} aria-hidden className="text-default-400" />}
          endContent={
            query ? (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Clear search"
                onPress={() => {
                  setQuery("");
                  setDebounced("");
                }}
              >
                <X size={15} />
              </Button>
            ) : null
          }
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <Chip
            as="button"
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "solid" : "flat"}
            color={filter === "all" ? "primary" : "default"}
            className="cursor-pointer"
          >
            All ({initial.length})
          </Chip>
          <Chip
            as="button"
            onClick={() => setFilter("online")}
            variant={filter === "online" ? "solid" : "flat"}
            color={filter === "online" ? "success" : "default"}
            className="cursor-pointer"
          >
            Online ({onlineCount})
          </Chip>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={initial.length === 0 ? "No players yet" : "No players found"}
          description={
            initial.length === 0
              ? "No player data has been synced from the Minecraft server yet. Data appears here automatically once players join."
              : "There are currently no players matching your search."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PlayerCard key={p.uuid} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
