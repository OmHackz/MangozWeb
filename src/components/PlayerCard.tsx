"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Coins, Swords, Clock } from "lucide-react";
import type { Player } from "@/lib/types";
import { formatMoney, formatPlaytime } from "@/lib/format";
import PlayerAvatar from "./PlayerAvatar";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350, damping: 24 }}>
      <Link href={`/players/${encodeURIComponent(player.username)}`} aria-label={`View ${player.username}`}>
        <Card
          isHoverable
          isPressable
          className="border border-default-200 transition-colors hover:border-primary-300"
          shadow="sm"
        >
          <CardBody className="flex flex-row items-center gap-4 p-4">
            <div className="relative shrink-0">
              <PlayerAvatar username={player.username} size={52} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${player.online ? "bg-success" : "bg-default-300"}`}
                aria-hidden
                title={player.online ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{player.username}</p>
                <Chip
                  size="sm"
                  variant="flat"
                  color={player.online ? "success" : "default"}
                >
                  {player.online ? "Online" : "Offline"}
                </Chip>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-default-500">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden /> {formatPlaytime(player.playtime)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Coins size={12} aria-hidden /> {formatMoney(player.money)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Swords size={12} aria-hidden /> {player.kills}K / {player.deaths}D
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
}
