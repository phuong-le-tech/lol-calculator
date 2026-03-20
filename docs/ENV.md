# Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
```

<!-- AUTO-GENERATED: env-start -->
## Database

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/lolsim` |

## Cache

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REDIS_URL` | No | Redis connection URL | `redis://localhost:6379` |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL (alternative to REDIS_URL) | `https://...` |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token | — |

## Authentication

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXTAUTH_URL` | Yes | Canonical URL of the app | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret for signing JWTs | Random string |

## OAuth Providers

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DISCORD_CLIENT_ID` | No | Discord OAuth client ID | — |
| `DISCORD_CLIENT_SECRET` | No | Discord OAuth client secret | — |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret | — |

## Data Dragon

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DDRAGON_BASE_URL` | No | Data Dragon CDN base URL | `https://ddragon.leagueoflegends.com` |
| `DDRAGON_PATCH_OVERRIDE` | No | Override auto-detected patch version | `14.1.1` |

## Application

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | No | Public-facing app URL | `http://localhost:3000` |
| `ADMIN_API_KEY` | No | API key for admin endpoints | Random string |
<!-- AUTO-GENERATED: env-end -->
