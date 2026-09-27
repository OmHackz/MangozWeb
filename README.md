# MangoZ SMP — companion website

Premium Minecraft SMP companion platform. Next.js App Router + TypeScript + HeroUI + Tailwind + Lucide + Motion.

- Live URL: https://mangoz-smp.pages.dev
- Stack: Next.js 14, HeroUI v2, Tailwind 3, framer-motion, next-themes, lucide-react
- Backend: Next.js Route Handlers + free Supabase Postgres. Supabase is **required** for live data — without it the site shows honest empty states instead of fake data.
- Deploy: free on Vercel or Cloudflare Pages. No paid services, no credit card.

## Requirements

- Node.js 18.18+ (20+ recommended)
- npm 9+

## Installation

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Copy and edit:

```bash
cp .env.example .env.local
```

| Var | Scope | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | no | Canonical URL (default `https://mangoz-smp.pages.dev`) |
| `NEXT_PUBLIC_JAVA_ADDRESS` | public | no | Java IP (default `play.mangoz-smp.pages.dev`) |
| `NEXT_PUBLIC_BEDROCK_ADDRESS` | public | no | Bedrock IP |
| `NEXT_PUBLIC_BEDROCK_PORT` | public | no | Bedrock port (default `19132`) |
| `NEXT_PUBLIC_MAP_URL` | public | no | BlueMap/Dynmap embed URL; empty = placeholder |
| `NEXT_PUBLIC_DISCORD_URL` etc. | public | no | Only configured links are shown |
| `SUPABASE_URL` | server | **yes (for live data)** | Enables the database. Without it the site shows empty states |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **yes (for live data)** | **Server-only.** Never expose to browser |
| `MINECRAFT_API_KEY` | server | for MC sync | Protects `POST /api/minecraft/*`. Generate: `openssl rand -hex 32` |

> Never put secrets in `NEXT_PUBLIC_*`. Never commit `.env.local`.

## Database setup (free, required for live data)

The site reads everything from the database — there is no demo data. Until the
database is connected, pages show empty states ("No players yet",
"Status unavailable") instead of fake numbers.

Use **Supabase free tier**:

1. Create a free project at https://supabase.com (no card required).
2. SQL Editor → run these files from this repo, in order:
   - `supabase/schema.sql` (players, server status)
   - `supabase/store.sql` (store orders)
   - `supabase/bot.sql` (bot status)
   - `supabase/status_history.sql` (3-hour status graphs for server + bot)
   - `supabase/news.sql` (optional announcements; inbox falls back to built-ins)
   (If you ran an older version with integer `money`, the schema file includes the migration to `numeric`.)
3. Project Settings → API → copy `SUPABASE_URL` + `service_role` key into `.env.local` / hosting env vars.
4. Set `MINECRAFT_API_KEY` to the same key your Skript config uses.
5. Redeploy. `GET /api/health` should report `"db": "connected"` with player counts.
6. Join the Minecraft server — your player should appear on `/players` within seconds.

Free-tier notes: 500 MB DB, 2 GB bandwidth, pausing after inactivity on free projects. The site degrades to cached/demo reads if Supabase is unreachable; it never fakes "Online".

## Local development

```bash
npm run dev        # dev server
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm start          # serve production build
```

## Minecraft API setup

Write endpoints require `MINECRAFT_API_KEY` header (`x-api-key` or `Authorization: Bearer`):

```
POST /api/minecraft/player/join    { uuid, username, online?, playtime?, money?, kills?, deaths? }
POST /api/minecraft/player/leave   { uuid, username, ... }
POST /api/minecraft/player/update  { uuid, username, online?, ... }
POST /api/minecraft/server/status  { online, playersOnline, playersMax, version, javaOnline?, bedrockOnline?, motd? }
```

Public reads (no key): `GET /api/server/status`, `GET /api/players`, `GET /api/players/[username]`, `GET /api/stats`, `GET /api/leaderboards?by=money|playtime|kills|deaths`, `GET /api/health`.

Validation: UUID v4 format, `^[A-Za-z0-9_]{3,16}$` usernames, non-negative integers for playtime/kills/deaths, money accepts decimals up to 2 places (e.g. `1250.5`), 8 KB body cap, unknown fields rejected, per-IP rate limiting. Minecraft write endpoints return `503` with a clear message when the database is not configured.

Example:

```bash
curl -X POST http://localhost:3000/api/minecraft/player/update \
  -H 'Content-Type: application/json' -H "x-api-key: $MINECRAFT_API_KEY" \
  -d '{"uuid":"069a79f4-44e9-4726-a5be-fca90e38aaf5","username":"OmHackz","online":true,"playtime":12345,"money":5000,"kills":25,"deaths":4}'
# => {"success":true,...}
```

## Skript integration

Skript needs an HTTP addon (e.g. SkriptJSON / skript-web / Vixio). Never embed DB credentials in Skript — only the API key + site URL.

```vb
# MangoZ SMP → website sync (pseudo-Skript, adapt to your HTTP addon)
on join:
  set {_uuid} to uuid of player
  set {_body} to "{""uuid"":""%{_uuid}%"",""username"":""%player%"",""online"":true}"
  # POST {_body} to https://mangoz-smp.pages.dev/api/minecraft/player/join
  # with header "x-api-key: %env MINECRAFT_API_KEY%"

every 5 minutes:
  loop all players:
    # POST playtime / balance / kills / deaths to /api/minecraft/player/update

on quit:
  # POST to /api/minecraft/player/leave

every 1 minute:
  # POST { online, playersOnline, playersMax, version } to /api/minecraft/server/status
```

Store the key in an env var / server-side config file, never in a public repo.

## Bot status API (AFK bot)

The Minecraft AFK bot reports in with an API key (`BOT_API_KEY`, falls back to `MINECRAFT_API_KEY`).
Full spec with Mineflayer/Python examples: [`BOT_API.md`](./BOT_API.md).

```
POST /api/bot/status   { online, uptimeSeconds, account?, version?, latencyMs? }
GET  /api/bot/status   public — powers the /bot page
```

Example:

```bash
curl -X POST http://localhost:3000/api/bot/status \
  -H 'Content-Type: application/json' -H "x-api-key: $BOT_API_KEY" \
  -d '{"online":true,"uptimeSeconds":3600,"account":"MangoZ_AFK","version":"1.4.0","latencyMs":42}'
# => {"success":true,...}
```

Report on connect/disconnect plus a 60s heartbeat. Set `NEXT_PUBLIC_BOT_DASHBOARD_URL` to link the bot's own dashboard from `/bot`.

## Store (ranks, donations, UPI, INR)

`/store` sells lifetime ranks (VIP ₹10, VIP+ ₹15, MVP ₹20, MVP+ ₹30) plus
one-time server donations (hosting ₹100, database ₹50, site ₹50 — edit prices
and perks in `src/config/store.ts`). Donation goal progress (`raisedInr`) is
updated manually in the same file as payments are verified.
Rank names and perks support Minecraft color codes (`&a`, `&l`, ...).

Flow: pick a rank → pay via UPI QR (`9732234305-2@ibl`) → submit the 12-digit
UTR → order saved as `pending`. Staff verify payment (Supabase `store_orders`
table, or the Discord ping) and grant the rank in game.

- Prices are taken from the server config — client amounts are ignored.
- Set `ORDER_WEBHOOK_URL` (Discord webhook) to get pinged on every order.
- Buyers track orders in `/inbox` (device-local receipts).

## Login & inbox

Login is username-only (no password): the name is stored in the browser and
used for the store, inbox and profile links. `/inbox` shows staff
announcements (`announcements` table, else built-ins) plus the device's order
receipts.

## Artwork & fonts

- Save the logo files as `public/logo-text.png` (banner) and
  `public/logo-mango.png` (mango-on-block mark). The site falls back to a
  styled text logo when they are missing.
- Headings/buttons use a pixel stack ("Minecraft Ten" → "Minecraft Five" →
  Press Start 2P). To use the official fonts, drop licensed
  `minecraft-ten.woff2` / `minecraft-five.woff2` files into `public/fonts/` —
  no code change needed.

## Deployment — Vercel (free)

1. Push to GitHub.
2. https://vercel.com → New Project → import repo (Hobby plan, free, no card).
3. Env vars: set `NEXT_PUBLIC_*` + (optional) `SUPABASE_*` + `MINECRAFT_API_KEY`.
4. Deploy. Custom domain optional.

## Deployment — Cloudflare Pages (free)

1. Push to GitHub.
2. Cloudflare Dashboard → Pages → Create → Connect to Git → select repo.
3. Build: Framework `Next.js`, command `npx @cloudflare/next-on-pages@1` (or `npm run build` for static-compatible output), output `.vercel/output/static` per next-on-pages docs.
4. Env vars: same as Vercel.
5. Deploy. Free plan, no card for basic use.

## Free-tier considerations

- Vercel Hobby: bandwidth/build-minute limits; fine for community SMP sites.
- Cloudflare Pages: generous free bandwidth.
- Supabase free: 500 MB, pauses when idle; site falls back gracefully.
- No auth provider, CDN, monitoring or DB costs required. Heavy features (map tiles) should stay on the Minecraft host / BlueMap host.

## Project structure

```
app/            routes + API handlers
  api/          public reads + protected /minecraft writes
src/
  components/   Navbar, Footer, ServerStatus, PlayerCard, StatCard, ...
  config/       site.ts, server.ts (central addresses — no hard-coded IPs)
  lib/          data.ts (Supabase-or-demo layer), validation, rate-limit, format
supabase/       schema.sql
```

## Security

- Secrets server-side only; Minecraft key never shipped to browser.
- RLS: public `SELECT` only; writes via service role from API routes.
- Input validation + body cap + rate limits on all Minecraft endpoints.
- `/admin` is `noindex` and gated (auth TODO) — no public admin actions.
