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
