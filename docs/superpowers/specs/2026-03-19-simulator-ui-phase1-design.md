# Simulator UI — Phase 1 Design Spec

## Overview

Build the core frontend UI for the LoL Damage Simulator. Phase 1 delivers the 3-column layout shell, champion selection, level adjustment, stats display, and a dummy target panel with real-time damage calculations.

## Decisions

- **Architecture:** Single-page SPA, one route (`/`), all interactive state in Zustand
- **Data fetching:** Hybrid — Server Components fetch champion/item catalog, client components handle interaction
- **Styling:** Custom Tailwind CSS theme, no component library. Fonts: Russo One (logo), Chakra Petch (UI)
- **Calculations:** Client-side using `@lol-sim/engine` directly, recomputed on every state change via `useMemo`
- **Scope:** Stats tab only. Abilities and Breakdown tabs render "Coming soon" placeholders. Items, runes, and summoner spells show non-interactive placeholder slots. Target supports dummy mode only (champion and monster target types are stubbed).

## Phasing Context

This is Phase 1 of 4:

1. **Phase 1 (this spec):** Layout shell, champion select, level slider, stats tab, dummy target
2. **Phase 2:** Item slots, item select modal, item detail view, stat recalculation with items
3. **Phase 3:** Abilities tab, breakdown tab, combo builder, time-to-kill display
4. **Phase 4:** Runes picker, champion target, monster target, synergy/counter tabs

## Layout

Full viewport height, fixed 3-column layout matching the mockup at 1440x900.

```
┌──────────────────────────────────────────────────────┐
│ TopBar (48px)                                        │
│ Logo (left)    Patch (center)    Profile (right)     │
├──────────┬────────────────────────────┬──────────────┤
│ Left     │ Center                     │ Right        │
│ 300px    │ fill                       │ 320px        │
│ bg-panel │ bg-deepest                 │ bg-panel     │
│          │                            │              │
│ Champion │ Champion Header            │ Target       │
│ Grid     │ (portrait + HP bar + DPS)  │ Type Tabs    │
│          │                            │              │
│ Champion │ Tab Bar                    │ Target Info  │
│ Info     │ (Stats|Abilities|Breakdown)│              │
│          │                            │ Level        │
│ Level    │ Stats Table                │ Runes (stub) │
│ Runes    │ (two-column stat grid)     │ Resistances  │
│ Spells   │                            │ Effective HP │
│ Items    │                            │ Damage Mix   │
│          │                            │ Time to Kill │
└──────────┴────────────────────────────┴──────────────┘
```

- Left sidebar: 300px, `bg-panel`, right border 1px `border-default`
- Center: fills remaining, `bg-deepest` shows through (no explicit bg)
- Right sidebar: 320px, `bg-panel`, left border 1px `border-default`
- TopBar: 48px height, `bg-panel`, bottom border 1px `border-default`

## File Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout, Google Fonts (Russo One, Chakra Petch)
│   ├── page.tsx                # Server Component: fetch data, render SimulatorPage
│   └── globals.css             # Updated Tailwind theme with all design tokens
├── components/
│   ├── SimulatorPage.tsx       # Client component shell, hydrates data store
│   ├── layout/
│   │   ├── TopBar.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── CenterPanel.tsx
│   │   └── RightSidebar.tsx
│   ├── champion/
│   │   ├── ChampionGrid.tsx         # 3x2 quick-pick grid in sidebar
│   │   ├── ChampionInfo.tsx         # Selected champion details block
│   │   ├── ChampionHeader.tsx       # Center top: portrait + HP/mana bars + DPS
│   │   ├── ChampionSelectModal.tsx  # Full champion picker with search + filters
│   │   └── EmptyState.tsx           # "Select Your Champion" placeholder
│   ├── stats/
│   │   ├── StatsTable.tsx           # Two-column stat grid
│   │   ├── AbilitiesTab.tsx         # Placeholder for Phase 3
│   │   └── BreakdownTab.tsx         # Placeholder for Phase 3
│   ├── target/
│   │   ├── TargetPanel.tsx          # Right sidebar content wrapper
│   │   ├── TargetViewTabs.tsx       # Champion | Synergy | Counter tabs
│   │   ├── DummyTarget.tsx          # Custom HP/Armor/MR inputs
│   │   ├── ChampionTarget.tsx       # Stub for Phase 4
│   │   └── MonsterTarget.tsx        # Stub for Phase 4
│   └── shared/
│       ├── LevelSlider.tsx
│       ├── TabBar.tsx
│       └── HealthBar.tsx
├── hooks/
│   └── useSimulationResult.ts  # Derived computation from store state
└── stores/
    ├── useSimulatorStore.ts    # Champion, level, items, target state
    └── useDataStore.ts         # Champion/item catalog cache
```

## State Management

### `useDataStore`

Holds fetched catalog data. Populated once from server props.

```typescript
interface DataStore {
  champions: Champion[]
  items: Item[]
  patchVersion: string
  setData: (champions: Champion[], items: Item[], patchVersion: string) => void
  getChampion: (id: string) => Champion | undefined
  getItem: (id: number) => Item | undefined
}
```

### `useSimulatorStore`

All interactive state. No computed results stored here.

```typescript
interface SimulatorStore {
  // Attacker
  selectedChampionId: string | null
  level: number                           // 1-18
  itemIds: number[]                       // max 6, empty in Phase 1
  abilityRanks: Record<string, number>    // auto-calculated from level in Phase 1

  // Target
  // NOTE: The engine's Target type uses "custom" | "champion". The UI uses
  // "custom" | "champion" | "monster" — "monster" is a UI-only concept that
  // maps to "custom" with pre-filled stats when passed to engine functions.
  targetMode: "custom" | "champion" | "monster"
  customTarget: { hp: number; armor: number; mr: number }
  targetChampionId: string | null         // Phase 4
  targetLevel: number                     // Phase 4
  monsterType: string | null              // Phase 4

  // UI
  activeTab: "stats" | "abilities" | "breakdown"
  isChampionSelectOpen: boolean

  // Actions
  setChampion: (id: string) => void
  setLevel: (level: number) => void
  setActiveTab: (tab: "stats" | "abilities" | "breakdown") => void
  setTargetMode: (mode: "custom" | "champion" | "monster") => void
  setCustomTarget: (stats: Partial<{ hp: number; armor: number; mr: number }>) => void
  setChampionSelectOpen: (open: boolean) => void
  reset: () => void
}
```

### `useSimulationResult` hook

Derives all computed results from store state. Recomputes via `useMemo` on any dependency change.

```typescript
interface SimulationResult {
  stats: FinalStats | null
  autoAttack: {
    raw: number
    final: number
    dps: number
    effectiveArmor: number
  } | null
  timeToKill: {
    autoOnly: number
  } | null
  effectiveHP: {
    physical: number
    magic: number
  } | null
}

function useSimulationResult(): SimulationResult
```

**Computation pipeline:**
1. Look up champion from data store by `selectedChampionId`
2. `mergeStats(champion.baseStats, level, aggregateItemStats([]))` → `FinalStats`
3. `calcAutoAttackDamage(stats, level, target)` → auto attack result
4. `calcTimeToKillAutoOnly(stats, level, target)` → TTK
5. Effective HP uses post-penetration resist: `calcEffectiveResist({ baseResist: target.armor, lethality: stats.lethality, percentPen: stats.armorPen })` → effectiveArmor, then `target.hp * (1 + effectiveArmor/100)` for physical. Same pattern for MR. "vs True" is simply `target.hp`.

## Data Flow

```
Server (page.tsx)
  │
  │  const client = new DataClient()
  │  const version = await client.getLatestVersion()
  │  fetchAllChampions(client, version) → Champion[]
  │  fetchAllItems(client, version) → Item[]
  │
  ▼
SimulatorPage (client component)
  │
  │  Hydrates useDataStore on mount (via useEffect, runs once)
  │
  ▼
Components read from stores:
  useDataStore → champion/item catalog
  useSimulatorStore → interactive state
  useSimulationResult() → derived calculations
```

## Component Behavior

### TopBar
- Left: "LoL Sim" logo text (Russo One, 18px, gold-mid)
- Center: "Patch v{version}" (Chakra Petch, 12px, text-muted)
- Right: Search icon + profile placeholder (non-interactive in Phase 1)

### Left Sidebar

**ChampionGrid:**
- 3-column grid of champion portrait thumbnails
- Shows first 6 champions from catalog (sorted alphabetically)
- Gold border on the selected champion
- Clicking a portrait calls `setChampion(id)`

**ChampionInfo:**
- Champion portrait (larger), name, role tag pill
- If no champion: shows "No Champion" with muted text

**LevelSlider:**
- Range input 1-18
- Large level number display (48px+ font, gold accent)
- Label: "LEVEL"

**Runes section:** "RUNES" label + row of placeholder circle slots (non-interactive)

**Summoner Spells section:** "SUMMONER SPELLS" label + 2 placeholder slots (non-interactive)

**Items section:** "ITEMS" label + row of 6 empty square slots (non-interactive in Phase 1)

### Center Panel

**EmptyState** (no champion selected):
- Centered vertically and horizontally
- Swirling/spinner icon (decorative)
- "Select Your Champion" heading (24px, gold-light)
- "Choose a champion from the sidebar or use the search to find your main" subtitle
- CTA button: "Click a champion tile or use the select bar" → opens champion select modal
- Subtle radial gold gradient behind icon (`gold-glow`)

**ChampionHeader** (champion selected):
- Left: Large champion portrait (80x80), name (24px), role/class tag
- Center: HP bar (green, shows base + bonus segments) and mana bar (blue) with numeric values
- Right: Large DPS number (48px, gold), "Damage per second" label, "LETHAL" badge if combo is lethal

**TabBar:**
- Three tabs: Stats | Abilities | Breakdown
- Gold underline on active tab
- Only Stats is functional; others show placeholder content

**StatsTable:**
- Two-column grid layout
- Left column: Attack Damage, Health, Armor, Attack Speed, Crit Chance, Lethality, Ability Haste, Armor Pen%
- Right column: Ability Power, Mana, Magic Resist, Ability Haste, On-hit Dmg, Flat Magic Pen, Magic Pen%
- Each row: stat name (text-muted), value with base+bonus format where applicable (e.g., "293 (+129)")
- Subtle alternating row backgrounds for readability

### Right Sidebar

**TargetViewTabs:**
- Three tabs at top: Champion | Synergy | Counter
- These are analysis view tabs (not target type selectors). In Phase 1 they are visual only — the panel always shows the custom (dummy) target regardless of which tab appears active.
- Tab styling matches mockup (pill-style, gold-mid active)
- Target type switching (custom/champion/monster) will be added in Phase 4 via a separate selector.

**Target info area:**
- Target name display: "Dummy" with generic target icon
- For champion/monster modes: shows "Coming soon" badge

**DummyTarget:**
- Three number inputs with labels:
  - HP (default: 2000, range: 1-99999)
  - Armor (default: 100, range: 0-1000)
  - Magic Resist (default: 100, range: 0-1000)
- Each input updates `customTarget` in store

**Level display:** Shows target level (matches attacker level for dummy)

**Runes:** Placeholder section (non-interactive)

**Resistance bars:**
- Armor: horizontal bar with orange fill (`stat-armor`), numeric value
- MR: horizontal bar with purple fill (`stat-mr`), numeric value
- Bar width proportional to value (capped at some visual max)

**Effective HP display:**
- "EFFECTIVE HP" label
- Three rows: "vs Physical" (dmg-physical color), "vs Magic" (dmg-magic color), "vs True" (dmg-true color)
- Each shows computed effective HP value

**Damage Mix bar:**
- Stacked horizontal bar showing % physical / % magic / % true damage
- Uses dmg-physical, dmg-magic, dmg-true colors

**Time to Kill:**
- Large display: seconds with 1 decimal (e.g., "5.8s")
- Below: breakdown showing auto attack count and time

### ChampionSelectModal

- Overlay modal with dark backdrop
- "SELECT TARGET CHAMPION" header with close button
- Search input: filters champions by name (case-insensitive substring match)
- Role filter pills: All | Fighter | Tank | Mage | Marksman | Assassin | Support
- Note: `Champion.role` is a single string. Filter matches if `champion.role` includes the selected role (case-insensitive). Champions with multiple roles (from Meraki `roles[]`) are normalized to a single primary role.
- Champion grid: 4+ columns of portrait tiles with name below
- Clicking a champion: calls `setChampion(id)`, closes modal
- "Or use random" link: selects a random champion
- Filtered by both search text and selected role

## Color System

Updated `globals.css` Tailwind theme tokens. **This is a breaking change** to the existing theme — the current `page.tsx` landing page will be replaced entirely, so there are no backward compatibility concerns:

```
Background:     dark-600: #0a0e1a, dark-500: #111827, dark-400: #1a1f2e, dark-300: #242938
Border:         dark-200: #1f2937
Text:           dark-100: #9CA3AF, dark-50: #6B7280 (muted)
Gold:           gold-100: #F0E6D2, gold-200: #e8c870, gold-300: #C89B3C, gold-400: #C89B3C, gold-500: #A07D3A, gold-600: #785A28
Gold glow:      gold-glow: #C89B3C33

Damage:         dmg-physical: #FF7043, dmg-magic: #4FC3F7, dmg-true: #E8E8E8
Stats:          stat-health: #66BB6A, stat-armor: #FFB74D, stat-mr: #CE93D8
                stat-as: #FFF176, stat-crit: #F44336, stat-ms: #81D4FA
Status:         color-error: #EF4444, color-success: #22C55E, color-warning: #F59E0B
```

## Fonts

Loaded via `next/font/google` in `layout.tsx` (required — not `<link>` tags — because the existing CSP restricts `font-src` to `'self'`; `next/font/google` self-hosts at build time):
- **Russo One:** Logo text only
- **Chakra Petch:** All other UI text (weights: 400, 500, 600, 700)

Applied as CSS variables (`--font-logo`, `--font-ui`) for Tailwind `fontFamily` extension.

## Engine Integration

All calculations use `@lol-sim/engine` functions directly in the browser:

| UI Element | Engine Function | Inputs |
|---|---|---|
| Stats table | `mergeStats()` | champion.baseStats, level, aggregateItemStats([]) |
| Auto attack DPS | `calcAutoAttackDamage()` | stats, level, target |
| Time to kill | `calcTimeToKillAutoOnly()` | stats, level, target |
| Effective armor | `calcEffectiveResist()` | `{ baseResist: target.armor, lethality: stats.lethality, percentPen: stats.armorPen }` |
| Effective MR | `calcEffectiveResist()` | `{ baseResist: target.mr, flatMagicPen: stats.magicPen, percentPen: stats.magicPenPercent }` |

**Note:** `calcEffectiveResist` takes a single `PenetrationParams` object, not positional arguments. `aggregateItemStats` takes `ItemStats[]` (in Phase 2, map items via `items.map(i => i.stats)`).

## Error & Loading States

- **Data fetch failure:** `page.tsx` wraps data fetching in try/catch. On failure, render a full-page error message: "Failed to load game data. Please refresh." No retry logic in Phase 1.
- **Loading:** Next.js Server Components handle the async fetch. Add a `loading.tsx` with a centered spinner using the gold-glow color.
- **Image load failure:** Champion/item images use `next/image` with a fallback placeholder (gray square with question mark icon) via `onError` handler.

## Notes

- **On-hit Dmg in StatsTable:** `FinalStats` has no `onHitDamage` field. In Phase 1 (no items), this always displays 0. In Phase 2, it will be computed from item passives.
- **StatsTable bonus values:** "Base + bonus" format (e.g., "293 (+129)") is derived by comparing `calcChampionStats(baseStats, level)` (base only) vs `mergeStats(baseStats, level, itemStats)` (with items). In Phase 1 with no items, bonus is always 0 — show just the base value.

## Non-Goals (Phase 1)

- Item selection and stat contribution
- Ability details and damage per ability
- Combo builder and combo damage
- Rune selection and effects
- Summoner spell selection
- Champion or monster target modes (UI stubs only)
- Build saving/loading
- URL sharing
- Authentication
- Responsive/mobile layout
