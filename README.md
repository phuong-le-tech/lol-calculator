# LoL Damage Simulator

Real-time League of Legends damage calculator. Select a champion, equip items, configure a target, and instantly see DPS, combo damage, time-to-kill, and full damage breakdowns.

## Monorepo Structure

```
apps/web/           Next.js 15 web application
packages/engine/    Pure calculation engine (zero deps, runs client + server)
packages/types/     Shared TypeScript types
packages/ddragon/   Data client (Meraki Analytics + Riot Data Dragon)
prisma/             Database schema (PostgreSQL)
```

## Prerequisites

- Node.js 20+
- pnpm 9.15+
- PostgreSQL 16 (or Neon serverless)
- Redis (or Upstash)

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database, Redis, and OAuth credentials

# Generate Prisma client
pnpm --filter @lol-sim/web exec prisma generate

# Run database migrations
pnpm --filter @lol-sim/web exec prisma db push

# Start development server
pnpm dev
```

<!-- AUTO-GENERATED:scripts-start -->
## Available Commands

### Root (Turborepo)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers (Next.js with Turbopack) |
| `pnpm build` | Production build for all packages |
| `pnpm test` | Run all test suites |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |

### Engine (`packages/engine/`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @lol-sim/engine test` | Run engine unit tests (57 tests) |
| `pnpm --filter @lol-sim/engine test:watch` | Run tests in watch mode |
| `pnpm --filter @lol-sim/engine test:coverage` | Run tests with coverage report |

### Web (`apps/web/`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @lol-sim/web dev` | Start Next.js dev server with Turbopack |
| `pnpm --filter @lol-sim/web build` | Production build |
| `pnpm --filter @lol-sim/web start` | Start production server |
| `pnpm --filter @lol-sim/web lint` | Lint with ESLint |
<!-- AUTO-GENERATED:scripts-end -->

<!-- AUTO-GENERATED:env-start -->
## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/lolsim` |
| `REDIS_URL` | Yes* | Redis connection string | `redis://localhost:6379` |
| `UPSTASH_REDIS_REST_URL` | Yes* | Upstash Redis REST URL (alternative to REDIS_URL) | `https://...` |
| `UPSTASH_REDIS_REST_TOKEN` | Yes* | Upstash Redis REST token | |
| `NEXTAUTH_URL` | Yes | App URL for NextAuth callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret for signing JWT tokens | (generate with `openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` | Yes | Discord OAuth application ID | |
| `DISCORD_CLIENT_SECRET` | Yes | Discord OAuth secret | |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret | |
| `DDRAGON_BASE_URL` | No | Override Data Dragon CDN URL | `https://ddragon.leagueoflegends.com` |
| `DDRAGON_PATCH_OVERRIDE` | No | Force a specific patch version for testing | `16.6.1` |
| `NEXT_PUBLIC_APP_URL` | No | Public-facing app URL | `https://lolsim.gg` |
| `ADMIN_API_KEY` | No | API key for admin-only endpoints (data sync) | |

\* Either `REDIS_URL` or both `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` required.
<!-- AUTO-GENERATED:env-end -->

## Data Sources

| Data | Source | URL |
|------|--------|-----|
| Champion stats + abilities | Meraki Analytics | `cdn.merakianalytics.com/riot/lol/resources/latest/en-US/` |
| Item stats + passives | Meraki Analytics | (same) |
| Patch versions | Riot Data Dragon | `ddragon.leagueoflegends.com/api/versions.json` |
| Champion/item/ability icons | Riot Data Dragon CDN | `ddragon.leagueoflegends.com/cdn/{version}/img/` |

## Calculation Engine

The engine (`packages/engine/`) is a pure TypeScript library with zero dependencies. All formulas match Riot's official implementations:

- **Stat growth** — curved scaling formula (`base + growth * (level-1) * (0.7025 + 0.0175 * (level-1))`)
- **Attack speed** — base AS * (1 + bonus%) with 2.5 cap
- **Penetration** — full order: flat reduction > % reduction > % pen > lethality
- **Damage after resist** — handles positive resist (reduction) and negative resist (amplification)
- **Critical strike** — average multiplier with Infinity Edge threshold
- **Combo simulation** — user-defined ability + auto-attack sequences with HP tracking
- **Item passives** — hook-based system (preCalculation, onAutoAttack, onCrit, etc.)

57 unit tests validate all formulas against known in-game values.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Data Fetching | TanStack Query |
| Database | PostgreSQL (Prisma ORM) |
| Cache | Redis / Upstash |
| Auth | NextAuth.js v5 (JWT) |
| Testing | Vitest (unit), Playwright (E2E) |
| Monorepo | Turborepo + pnpm |
| Hosting | Vercel |

## License

MIT
