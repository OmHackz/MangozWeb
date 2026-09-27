# MangoZ SMP — AFK Bot API

How the Minecraft AFK bot talks to the website. Two endpoints, one API key.

Base URL (production): `https://mangoz-smp.vercel.app`

---

## Auth

Both write endpoints use a shared secret. Send it as either header:

```
x-api-key: <BOT_API_KEY>
Authorization: Bearer <BOT_API_KEY>
```

- `POST /api/bot/status` accepts `BOT_API_KEY`, falling back to `MINECRAFT_API_KEY`.
- Set `BOT_API_KEY` in the website's env vars (generate: `openssl rand -hex 32`).
  Use a **different** key than the Minecraft server key when you can.
- Never ship the key in client-side code or a public repo.

---

## Bot → website: report status

```
POST /api/bot/status
Content-Type: application/json
```

### Fields

| Field | Type | Required | Rules |
|---|---|---|---|
| `online` | boolean | yes | `true` while the bot is connected to the server |
| `uptimeSeconds` | integer | yes | Seconds since the bot process started, `>= 0` |
| `account` | string | no | The bot's Minecraft username (`3–16` chars, `A–Z a–z 0–9 _`) |
| `version` | string | no | Bot software version, max 32 chars (e.g. `"1.4.0"`) |
| `latencyMs` | integer | no | Ping to the Minecraft server in ms, `>= 0` |

Unknown fields are rejected. Bodies over 8 KB are rejected. Rate limit: 120 req/min per IP.

### Example payload

```json
{
  "online": true,
  "uptimeSeconds": 86400,
  "account": "MangoZ_AFK",
  "version": "1.4.0",
  "latencyMs": 42
}
```

### curl

```bash
curl -X POST https://mangoz-smp.vercel.app/api/bot/status \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $BOT_API_KEY" \
  -d '{"online":true,"uptimeSeconds":3600,"account":"MangoZ_AFK","version":"1.4.0","latencyMs":42}'
```

### Node.js (Mineflayer)

```js
const startedAt = Date.now();

async function reportStatus(bot, online) {
  const body = {
    online,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    account: bot.username,
    version: "1.4.0",
    latencyMs: Math.round(bot.player?.ping ?? 0),
  };
  try {
    const res = await fetch("https://mangoz-smp.vercel.app/api/bot/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.BOT_API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[bot-api] report failed:", res.status, await res.text());
  } catch (err) {
    console.error("[bot-api] report error:", err.message);
  }
}

bot.on("spawn", () => reportStatus(bot, true));
bot.on("end", () => reportStatus(bot, false));
setInterval(() => reportStatus(bot, true), 60_000); // heartbeat every 60s
```

### Python

```python
import os, time, requests

STARTED_AT = time.time()
API = "https://mangoz-smp.vercel.app/api/bot/status"
KEY = os.environ["BOT_API_KEY"]

def report(online: bool, account: str, version: str, latency_ms: int = 0):
    r = requests.post(API, json={
        "online": online,
        "uptimeSeconds": int(time.time() - STARTED_AT),
        "account": account,
        "version": version,
        "latencyMs": latency_ms,
    }, headers={"x-api-key": KEY}, timeout=10)
    r.raise_for_status()

# on connect:  report(True, "MangoZ_AFK", "1.4.0", latency_ms=42)
# every 60s:   report(True, "MangoZ_AFK", "1.4.0", latency_ms=42)
# on shutdown: report(False, "MangoZ_AFK", "1.4.0")
```

### When to report

- On connect (`online: true`) and on disconnect/shutdown (`online: false`).
- Heartbeat every **60 seconds** while connected.
- The `/bot` page polls every 30s, so worst-case staleness is ~90s.
- Every report is also stored as a history point for the 3-hour uptime graph
  (`GET /api/status/history?service=bot&hours=3`). Points older than 7 days
  are pruned automatically.

### Responses

- `200 {"success": true, "bot": {...}}` — stored, visible on `/bot`.
- `400 {"success": false, "error": "..."}` — validation failed (see message).
- `401 {"success": false, "error": "Unauthorized"}` — wrong/missing key.
- `429` — rate limited, back off.
- `503` — database not configured on the website side.

---

## Website → everyone: read status

```
GET /api/bot/status
```

Public, no key. Powers the `/bot` page (cached 15s).

```json
{
  "success": true,
  "bot": {
    "online": true,
    "uptimeSeconds": 86400,
    "account": "MangoZ_AFK",
    "version": "1.4.0",
    "latencyMs": 42,
    "updatedAt": "2026-09-27T12:00:00.000Z"
  }
}
```

`503 {"success": false, "error": "Bot has not reported yet"}` when no report exists.

---

## Also useful for bots/hosts

Public read endpoints the bot (or anything else) can consume:

- `GET /api/server/status` — Minecraft server online, player counts, version
- `GET /api/players?online=true` — who's online right now
- `GET /api/health` — `db` is `"connected"` when the pipeline is healthy

## Database

Run `supabase/bot.sql` (after `schema.sql`). Single row `bot_status(id=1)`,
public read, writes via service role only.
