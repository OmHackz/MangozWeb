export interface Player {
  id: string;
  uuid: string;
  username: string;
  online: boolean;
  firstJoined: string; // ISO
  lastSeen: string; // ISO
  playtime: number; // seconds
  money: number;
  kills: number;
  deaths: number;
  blocksBroken?: number;
  blocksPlaced?: number;
}

export interface ServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string;
  javaOnline: boolean;
  bedrockOnline: boolean;
  javaAddress: string;
  bedrockAddress: string;
  bedrockPort: string;
  updatedAt: string; // ISO
  motd?: string;
}

export interface ServerStats {
  totalPlayers: number;
  onlinePlayers: number;
  totalPlaytime: number;
  totalMoney: number;
  totalKills: number;
  totalDeaths: number;
  totalBlocksBroken: number;
  totalBlocksPlaced: number;
  updatedAt: string;
}

export type PillState = "up" | "down" | "partial" | "nodata";

export interface Pill {
  /** Bucket start (ISO). */
  t: string;
  state: PillState;
  /** 0–1 fraction of online reports in the bucket, null when no data. */
  uptime: number | null;
  /** Average players online in the bucket (server only). */
  players: number | null;
}
