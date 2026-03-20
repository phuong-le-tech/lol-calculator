# Contributing

## Prerequisites

- Node.js (v18+)
- pnpm 9.15.0 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Setup

```bash
pnpm install
```

## Project Structure

This is a pnpm monorepo managed by Turborepo.

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js 15 web application (React 19, Tailwind 4, Zustand) |
| `packages/engine` | Combat simulation engine (Vitest tests) |
| `packages/types` | Shared TypeScript type definitions |
| `packages/ddragon` | Data Dragon API client |

<!-- AUTO-GENERATED: scripts-start -->
## Available Commands

### Root (Turborepo)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all packages in development mode |
| `pnpm build` | Production build (all packages) |
| `pnpm lint` | Run linters across all packages |
| `pnpm test` | Run test suites across all packages |
| `pnpm typecheck` | TypeScript type checking across all packages |

### `apps/web`

| Command | Description |
|---------|-------------|
| `pnpm --filter @lol-sim/web dev` | Start Next.js dev server with Turbopack |
| `pnpm --filter @lol-sim/web build` | Production build |
| `pnpm --filter @lol-sim/web start` | Start production server |
| `pnpm --filter @lol-sim/web lint` | Run Next.js linter |
| `pnpm --filter @lol-sim/web typecheck` | TypeScript type check |

### `packages/engine`

| Command | Description |
|---------|-------------|
| `pnpm --filter @lol-sim/engine test` | Run tests (Vitest, single run) |
| `pnpm --filter @lol-sim/engine test:watch` | Run tests in watch mode |
| `pnpm --filter @lol-sim/engine test:coverage` | Run tests with coverage report |
| `pnpm --filter @lol-sim/engine typecheck` | TypeScript type check |
<!-- AUTO-GENERATED: scripts-end -->

## Testing

- Engine tests use **Vitest**: `pnpm --filter @lol-sim/engine test`
- Run all tests: `pnpm test`

## Code Style

- ESLint via `eslint-config-next` in the web app
- TypeScript strict mode
- Tailwind CSS v4 for styling

## PR Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] New features include tests
