/**
 * Data layer — Supabase (free tier) is the single source of truth.
 *
 * There is intentionally NO demo/seed fallback: serverless function instances
 * do not share memory, so anything not persisted in the database cannot be
 * displayed consistently. When the database is not configured or unreachable,
 * these functions throw DbUnavailableError and the UI shows honest
 * empty/error states instead of fake data.
 */

import { serverConfig } from "@/config/server";
import type { Player, ServerStats, ServerStatus } from "./types";

export class DbUnavailableError extends Error {
  constructor(message = "Database unavailable") {
    super(message);
    this.name = "DbUnavailableError";
  }
}

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL?.replace(/\/$/, "");
}

function supabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY
  );
}

export function dbConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseKey());
}

async function sb(path: string, init?: RequestInit): Promise<unknown> {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) {
    throw new DbUnavailableError(
      "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[db] network error on ${path}:`, err);
    throw new DbUnavailableError("Could not reach the database.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[db] Supabase ${res.status} on ${path}: ${body.slice(0, 300)}`);
    throw new DbUnavailableError("Database query failed.");
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as unknown) : null;
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
  blocks_broken?: number | null;
  blocks_placed?: number | null;
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

export async function getPlayers(): Promise<Player[]> {
  const rows = (await sb(
    "players?select=*&order=online.desc,playtime.desc&limit=500"
  )) as DbPlayerRow[];
  return rows.map(rowToPlayer);
}

export async function getPlayer(username: string): Promise<Player | null> {
  const rows = (await sb(
    `players?select=*&username=ilike.${encodeURIComponent(username)}&limit=1`
  )) as DbPlayerRow[];
  if (rows.length === 0) return null;
  return rowToPlayer(rows[0]);
}

export async function getServerStatus(): Promise<ServerStatus | null> {
  const rows = (await sb("server?id=eq.1&select=*&limit=1")) as Record<
    string,
    unknown
  >[];
  const r = rows[0];
  if (!r) return null;
  return {
    online: Boolean(r["online"]),
    playersOnline: Number(r["players_online"] ?? 0),
    playersMax: Number(r["players_max"] ?? serverConfig.maxPlayers),
    version: String(r["version"] ?? serverConfig.version),
    javaOnline: r["java_online"] !== false,
    bedrockOnline: Boolean(r["bedrock_online"] ?? true),
    javaAddress: String(r["java_address"] ?? serverConfig.java.address),
    bedrockAddress: String(r["bedrock_address"] ?? serverConfig.bedrock.address),
    bedrockPort: String(r["bedrock_port"] ?? serverConfig.bedrock.port),
    updatedAt: String(r["updated_at"] ?? new Date().toISOString()),
    motd: typeof r["motd"] === "string" ? (r["motd"] as string) : undefined,
  };
}

export async function getStats(): Promise<ServerStats> {
  const players = await getPlayers();
  return {
    totalPlayers: players.length,
    onlinePlayers: players.filter((p) => p.online).length,
    totalPlaytime: players.reduce((s, p) => s + p.playtime, 0),
    totalMoney: players.reduce((s, p) => s + p.money, 0),
    totalKills: players.reduce((s, p) => s + p.kills, 0),
    totalDeaths: players.reduce((s, p) => s + p.deaths, 0),
    totalBlocksBroken: players.reduce((s, p) => s + (p.blocksBroken ?? 0), 0),
    totalBlocksPlaced: players.reduce((s, p) => s + (p.blocksPlaced ?? 0), 0),
    updatedAt: new Date().toISOString(),
  };
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
  const now = new Date().toISOString();
  const payload = {
    uuid: input.uuid,
    username: input.username,
    online: input.online ?? true,
    last_seen: now,
    ...(input.playtime !== undefined ? { playtime: input.playtime } : {}),
    ...(input.money !== undefined
      ? { money: Math.round(input.money * 100) / 100 }
      : {}),
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
  })) as DbPlayerRow[] | null;
  if (rows && rows[0]) return rowToPlayer(rows[0]);
  // Fallback: echo what was stored.
  return {
    id: input.uuid,
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
  const updatedAt = new Date().toISOString();
  await sb("server?id=eq.1", {
    method: "PATCH",
    body: JSON.stringify({
      online: input.online,
      players_online: input.playersOnline,
      players_max: input.playersMax,
      version: input.version,
      java_online: input.javaOnline ?? true,
      bedrock_online: input.bedrockOnline ?? true,
      motd: input.motd ?? null,
      updated_at: updatedAt,
    }),
  });
  return {
    online: input.online,
    playersOnline: input.playersOnline,
    playersMax: input.playersMax,
    version: input.version,
    javaOnline: input.javaOnline ?? true,
    bedrockOnline: input.bedrockOnline ?? true,
    javaAddress: serverConfig.java.address,
    bedrockAddress: serverConfig.bedrock.address,
    bedrockPort: serverConfig.bedrock.port,
    updatedAt,
    motd: input.motd,
  };
}
