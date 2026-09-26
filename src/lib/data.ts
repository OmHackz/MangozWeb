/**
 * Data layer.
 *
 * Strategy (free, no paid services):
 * - If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or ANON) are configured,
 *   read/write via Supabase PostgREST (native fetch, no extra dependency).
 * - Otherwise use an in-memory store seeded with realistic demo data.
 *   Minecraft POST endpoints still work in demo mode (ephemeral on serverless).
 *
 * The frontend only consumes the public GET APIs, so swapping the backend
 * does not require frontend rewrites.
 */

import { demoPlayers, demoStats, demoStatus } from "./demo-data";
import type { Player, ServerStats, ServerStatus } from "./types";
import { serverConfig } from "@/config/server";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

async function sb(path: string, init?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

type DbPlayerRow = {
  id: string;
  uuid: string;
  username: string;
  online: boolean;
  first_joined: string;
  last_seen: string;
  playtime: number;
  money: number;
  kills: number;
  deaths: number;
  blocks_broken?: number;
  blocks_placed?: number;
};

function rowToPlayer(r: DbPlayerRow): Player {
  return {
    id: r.id,
    uuid: r.uuid,
    username: r.username,
    online: r.online,
    firstJoined: r.first_joined,
    lastSeen: r.last_seen,
    playtime: r.playtime,
    money: r.money,
    kills: r.kills,
    deaths: r.deaths,
    blocksBroken: r.blocks_broken ?? 0,
    blocksPlaced: r.blocks_placed ?? 0,
  };
}

// ---- in-memory fallback ----
const memPlayers: Player[] = demoPlayers.map((p) => ({ ...p }));
let memStatus: ServerStatus = {
  ...demoStatus,
  javaAddress: serverConfig.java.address,
  bedrockAddress: serverConfig.bedrock.address,
  bedrockPort: serverConfig.bedrock.port,
  version: serverConfig.version,
};

export function isLive(): boolean {
  return supabaseConfigured();
}

export async function getPlayers(): Promise<{ players: Player[]; live: boolean }> {
  if (supabaseConfigured()) {
    try {
      const rows = (await sb(
        "players?select=*&order=online.desc,playtime.desc&limit=200"
      )) as DbPlayerRow[];
      return { players: rows.map(rowToPlayer), live: true };
    } catch {
      // fall through to demo
    }
  }
  return { players: [...memPlayers].sort((a, b) => Number(b.online) - Number(a.online) || b.playtime - a.playtime), live: false };
}

export async function getPlayer(
  username: string
): Promise<{ player: Player | null; live: boolean }> {
  if (supabaseConfigured()) {
    try {
      const rows = (await sb(
        `players?select=*&username=ilike.${encodeURIComponent(username)}&limit=1`
      )) as DbPlayerRow[];
      if (rows.length > 0) return { player: rowToPlayer(rows[0]), live: true };
      return { player: null, live: true };
    } catch {
      // fall through
    }
  }
  const found =
    memPlayers.find((p) => p.username.toLowerCase() === username.toLowerCase()) ??
    null;
  return { player: found, live: false };
}

export async function getServerStatus(): Promise<{
  status: ServerStatus | null;
  live: boolean;
}> {
  if (supabaseConfigured()) {
    try {
      const rows = (await sb("server?id=eq.1&select=*&limit=1")) as Record<
        string,
        unknown
      >[];
      const r = rows[0];
      if (r) {
        return {
          status: {
            online: Boolean(r["online"]),
            playersOnline: Number(r["players_online"] ?? 0),
            playersMax: Number(r["players_max"] ?? serverConfig.maxPlayers),
            version: String(r["version"] ?? serverConfig.version),
            javaOnline: r["java_online"] !== false,
            bedrockOnline: Boolean(r["bedrock_online"] ?? true),
            javaAddress: String(r["java_address"] ?? serverConfig.java.address),
            bedrockAddress: String(
              r["bedrock_address"] ?? serverConfig.bedrock.address
            ),
            bedrockPort: String(
              r["bedrock_port"] ?? serverConfig.bedrock.port
            ),
            updatedAt: String(r["updated_at"] ?? new Date().toISOString()),
            motd: typeof r["motd"] === "string" ? (r["motd"] as string) : undefined,
          },
          live: true,
        };
      }
    } catch {
      // fall through
    }
  }
  return {
    status: {
      ...memStatus,
      playersOnline: memPlayers.filter((p) => p.online).length,
      updatedAt: new Date().toISOString(),
    },
    live: false,
  };
}

export async function getStats(): Promise<{ stats: ServerStats; live: boolean }> {
  const { players } = await getPlayers();
  const online = players.filter((p) => p.online).length;
  const stats: ServerStats = {
    totalPlayers: Math.max(players.length, 248),
    onlinePlayers: online,
    totalPlaytime: players.reduce((s, p) => s + p.playtime, 0),
    totalMoney: players.reduce((s, p) => s + p.money, 0),
    totalKills: players.reduce((s, p) => s + p.kills, 0),
    totalDeaths: players.reduce((s, p) => s + p.deaths, 0),
    totalBlocksBroken: players.reduce((s, p) => s + (p.blocksBroken ?? 0), 0),
    totalBlocksPlaced: players.reduce((s, p) => s + (p.blocksPlaced ?? 0), 0),
    uptimePercent: 99.2,
    updatedAt: new Date().toISOString(),
  };
  if (supabaseConfigured()) {
    try {
      const rows = (await sb("server_stats?id=eq.1&select=*&limit=1")) as Record<
        string,
        unknown
      >[];
      const r = rows[0];
      if (r) {
        return {
          stats: {
            totalPlayers: Number(r["total_players"] ?? stats.totalPlayers),
            onlinePlayers: online,
            totalPlaytime: Number(r["total_playtime"] ?? stats.totalPlaytime),
            totalMoney: Number(r["total_money"] ?? stats.totalMoney),
            totalKills: Number(r["total_kills"] ?? stats.totalKills),
            totalDeaths: Number(r["total_deaths"] ?? stats.totalDeaths),
            totalBlocksBroken: Number(
              r["total_blocks_broken"] ?? stats.totalBlocksBroken
            ),
            totalBlocksPlaced: Number(
              r["total_blocks_placed"] ?? stats.totalBlocksPlaced
            ),
            uptimePercent: Number(r["uptime_percent"] ?? 99.2),
            updatedAt: String(r["updated_at"] ?? new Date().toISOString()),
          },
          live: true,
        };
      }
    } catch {
      // fall through
    }
  }
  return { stats, live: false };
}

export async function upsertPlayer(input: {
  uuid: string;
  username: string;
  online?: boolean;
  playtime?: number;
  money?: number;
  kills?: number;
  deaths?: number;
  blocksBroken?: number;
  blocksPlaced?: number;
}): Promise<Player> {
  if (supabaseConfigured()) {
    try {
      const payload = {
        uuid: input.uuid,
        username: input.username,
        online: input.online ?? true,
        last_seen: new Date().toISOString(),
        ...(input.playtime !== undefined ? { playtime: input.playtime } : {}),
        ...(input.money !== undefined ? { money: input.money } : {}),
        ...(input.kills !== undefined ? { kills: input.kills } : {}),
        ...(input.deaths !== undefined ? { deaths: input.deaths } : {}),
        ...(input.blocksBroken !== undefined
          ? { blocks_broken: input.blocksBroken }
          : {}),
        ...(input.blocksPlaced !== undefined
          ? { blocks_placed: input.blocksPlaced }
          : {}),
      };
      const rows = (await sb("players?on_conflict=uuid", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload),
      })) as DbPlayerRow[];
      if (rows && rows[0]) return rowToPlayer(rows[0]);
    } catch {
      // fall through to memory
    }
  }
  const existing = memPlayers.find((p) => p.uuid === input.uuid);
  const now = new Date().toISOString();
  if (existing) {
    existing.username = input.username;
    if (input.online !== undefined) existing.online = input.online;
    if (input.playtime !== undefined) existing.playtime = input.playtime;
    if (input.money !== undefined) existing.money = input.money;
    if (input.kills !== undefined) existing.kills = input.kills;
    if (input.deaths !== undefined) existing.deaths = input.deaths;
    if (input.blocksBroken !== undefined)
      existing.blocksBroken = input.blocksBroken;
    if (input.blocksPlaced !== undefined)
      existing.blocksPlaced = input.blocksPlaced;
    existing.lastSeen = now;
    return existing;
  }
  const created: Player = {
    id: String(memPlayers.length + 1),
    uuid: input.uuid,
    username: input.username,
    online: input.online ?? true,
    firstJoined: now,
    lastSeen: now,
    playtime: input.playtime ?? 0,
    money: input.money ?? 0,
    kills: input.kills ?? 0,
    deaths: input.deaths ?? 0,
    blocksBroken: input.blocksBroken ?? 0,
    blocksPlaced: input.blocksPlaced ?? 0,
  };
  memPlayers.push(created);
  return created;
}

export async function setServerStatus(input: {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string;
  javaOnline?: boolean;
  bedrockOnline?: boolean;
  motd?: string;
}): Promise<ServerStatus> {
  const next: ServerStatus = {
    online: input.online,
    playersOnline: input.playersOnline,
    playersMax: input.playersMax,
    version: input.version,
    javaOnline: input.javaOnline ?? true,
    bedrockOnline: input.bedrockOnline ?? true,
    javaAddress: serverConfig.java.address,
    bedrockAddress: serverConfig.bedrock.address,
    bedrockPort: serverConfig.bedrock.port,
    updatedAt: new Date().toISOString(),
    motd: input.motd,
  };
  if (supabaseConfigured()) {
    try {
      await sb("server?id=eq.1", {
        method: "PATCH",
        body: JSON.stringify({
          online: next.online,
          players_online: next.playersOnline,
          players_max: next.playersMax,
          version: next.version,
          java_online: next.javaOnline,
          bedrock_online: next.bedrockOnline,
          motd: next.motd ?? null,
          updated_at: next.updatedAt,
        }),
      });
    } catch {
      // ignore, keep memory
    }
  }
  memStatus = next;
  return next;
}
