const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;

export function isValidUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

export function isValidUsername(v: unknown): v is string {
  return typeof v === "string" && USERNAME_RE.test(v);
}

function isSafeNumber(v: unknown, max = 1_000_000_000): v is number {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    Number.isInteger(v) &&
    v >= 0 &&
    v <= max
  );
}

function isSafeMoney(v: unknown): v is number {
  // Money may arrive as a decimal (e.g. 1250.5 from economy plugins).
  return (
    typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1_000_000_000_000
  );
}

export interface PlayerUpdatePayload {
  uuid: string;
  username: string;
  online?: boolean;
  playtime?: number;
  money?: number;
  kills?: number;
  deaths?: number;
  blocksBroken?: number;
  blocksPlaced?: number;
}

const ALLOWED_KEYS = new Set([
  "uuid",
  "username",
  "online",
  "playtime",
  "money",
  "kills",
  "deaths",
  "blocksBroken",
  "blocksPlaced",
]);

export function validatePlayerPayload(body: unknown): {
  ok: boolean;
  error?: string;
  data?: PlayerUpdatePayload;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const obj = body as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_KEYS.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }
  if (!isValidUuid(obj.uuid)) return { ok: false, error: "Invalid uuid" };
  if (!isValidUsername(obj.username))
    return { ok: false, error: "Invalid username" };
  if (obj.online !== undefined && typeof obj.online !== "boolean")
    return { ok: false, error: "Invalid online flag" };
  if (obj.money !== undefined && !isSafeMoney(obj.money))
    return { ok: false, error: "Invalid numeric value for money" };
  const numericFields = [
    "playtime",
    "kills",
    "deaths",
    "blocksBroken",
    "blocksPlaced",
  ] as const;
  for (const f of numericFields) {
    if (obj[f] !== undefined && !isSafeNumber(obj[f])) {
      return { ok: false, error: `Invalid numeric value for ${f}` };
    }
  }
  return {
    ok: true,
    data: obj as unknown as PlayerUpdatePayload,
  };
}

export interface ServerStatusPayload {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string;
  javaOnline?: boolean;
  bedrockOnline?: boolean;
  motd?: string;
}

const STATUS_ALLOWED = new Set([
  "online",
  "playersOnline",
  "playersMax",
  "version",
  "javaOnline",
  "bedrockOnline",
  "motd",
]);

export function validateStatusPayload(body: unknown): {
  ok: boolean;
  error?: string;
  data?: ServerStatusPayload;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const obj = body as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!STATUS_ALLOWED.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }
  if (typeof obj.online !== "boolean")
    return { ok: false, error: "Invalid online flag" };
  if (!isSafeNumber(obj.playersOnline, 100000))
    return { ok: false, error: "Invalid playersOnline" };
  if (!isSafeNumber(obj.playersMax, 100000))
    return { ok: false, error: "Invalid playersMax" };
  if (
    typeof obj.version !== "string" ||
    obj.version.length === 0 ||
    obj.version.length > 32
  )
    return { ok: false, error: "Invalid version" };
  if (obj.javaOnline !== undefined && typeof obj.javaOnline !== "boolean")
    return { ok: false, error: "Invalid javaOnline" };
  if (obj.bedrockOnline !== undefined && typeof obj.bedrockOnline !== "boolean")
    return { ok: false, error: "Invalid bedrockOnline" };
  if (
    obj.motd !== undefined &&
    (typeof obj.motd !== "string" || obj.motd.length > 200)
  )
    return { ok: false, error: "Invalid motd" };
  return { ok: true, data: obj as unknown as ServerStatusPayload };
}

export function requireMinecraftAuth(req: Request): boolean {
  const expected = process.env.MINECRAFT_API_KEY;
  if (!expected) return false;
  const header =
    req.headers.get("x-api-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!header) return false;
  // constant-time-ish compare
  if (header.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < header.length; i++) {
    diff |= header.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function extractKey(req: Request): string | null {
  return (
    req.headers.get("x-api-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null
  );
}

function keyMatches(header: string | null, expected: string | undefined): boolean {
  if (!expected || !header) return false;
  if (header.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < header.length; i++) {
    diff |= header.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Bot endpoints accept BOT_API_KEY, falling back to MINECRAFT_API_KEY. */
export function requireBotAuth(req: Request): boolean {
  const header = extractKey(req);
  return (
    keyMatches(header, process.env.BOT_API_KEY) ||
    keyMatches(header, process.env.MINECRAFT_API_KEY)
  );
}

export interface BotStatusPayload {
  online: boolean;
  uptimeSeconds: number;
  /** The AFK bot's Minecraft username. */
  account?: string;
  /** Bot software version, e.g. "1.4.0". */
  version?: string;
  /** Ping to the Minecraft server in ms. */
  latencyMs?: number;
}

const BOT_ALLOWED = new Set([
  "online",
  "uptimeSeconds",
  "account",
  "version",
  "latencyMs",
]);

export function validateBotPayload(body: unknown): {
  ok: boolean;
  error?: string;
  data?: BotStatusPayload;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const obj = body as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!BOT_ALLOWED.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }
  if (typeof obj.online !== "boolean")
    return { ok: false, error: "Invalid online flag" };
  if (!isSafeInteger(obj.uptimeSeconds, 10_000_000_000))
    return { ok: false, error: "Invalid uptimeSeconds" };
  if (obj.account !== undefined && !isValidUsername(obj.account))
    return { ok: false, error: "Invalid account username" };
  if (
    obj.version !== undefined &&
    (typeof obj.version !== "string" || obj.version.length > 32)
  )
    return { ok: false, error: "Invalid version" };
  if (obj.latencyMs !== undefined && !isSafeInteger(obj.latencyMs, 600_000))
    return { ok: false, error: "Invalid latencyMs" };
  return { ok: true, data: obj as unknown as BotStatusPayload };
}

export interface StoreOrderPayload {
  username: string;
  itemId: string;
  utr: string;
}

const ORDER_ALLOWED = new Set(["username", "itemId", "utr"]);
const UTR_RE = /^\d{12}$/;

export function validateOrderPayload(
  body: unknown,
  validItemIds: string[]
): { ok: boolean; error?: string; data?: StoreOrderPayload } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const obj = body as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!ORDER_ALLOWED.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }
  if (!isValidUsername(obj.username))
    return { ok: false, error: "Invalid username" };
  if (typeof obj.itemId !== "string" || !validItemIds.includes(obj.itemId))
    return { ok: false, error: "Invalid item" };
  if (typeof obj.utr !== "string" || !UTR_RE.test(obj.utr.trim()))
    return { ok: false, error: "Transaction ID must be the 12-digit UPI reference number." };
  return {
    ok: true,
    data: {
      username: (obj.username as string).trim(),
      itemId: obj.itemId as string,
      utr: (obj.utr as string).trim(),
    },
  };
}

function isSafeInteger(v: unknown, max: number): v is number {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    Number.isInteger(v) &&
    v >= 0 &&
    v <= max
  );
}
