# Simulator UI Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3-column layout, champion select, level slider, stats table, and dummy target panel with real-time damage calculations.

**Architecture:** Single-page SPA on Next.js 15 App Router. Server Component fetches champion/item data from `@lol-sim/ddragon`, passes to a client `SimulatorPage` which hydrates a Zustand store. All calculations run client-side via `@lol-sim/engine`. Custom Tailwind CSS theme matching the mockup's dark navy/gold palette.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand, `@lol-sim/engine`, `@lol-sim/ddragon`, `@lol-sim/types`

**Spec:** `docs/superpowers/specs/2026-03-19-simulator-ui-phase1-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/app/globals.css` | Modify | Tailwind theme tokens (colors, fonts, semantic tokens) |
| `apps/web/src/app/layout.tsx` | Modify | Root layout with Google Fonts (Russo One, Chakra Petch) |
| `apps/web/src/app/page.tsx` | Modify | Server Component: fetch data, render SimulatorPage |
| `apps/web/src/app/loading.tsx` | Create | Loading spinner during SSR data fetch |
| `apps/web/src/stores/useDataStore.ts` | Create | Zustand store for champion/item catalog |
| `apps/web/src/stores/useSimulatorStore.ts` | Create | Zustand store for interactive state |
| `apps/web/src/hooks/useSimulationResult.ts` | Create | Derived calculations hook (engine integration) |
| `apps/web/src/components/SimulatorPage.tsx` | Create | Client shell: hydrates stores, renders 3-column layout |
| `apps/web/src/components/layout/TopBar.tsx` | Create | Logo, patch version, profile placeholder |
| `apps/web/src/components/layout/LeftSidebar.tsx` | Create | Left column wrapper |
| `apps/web/src/components/layout/CenterPanel.tsx` | Create | Center column: header + tabs + content |
| `apps/web/src/components/layout/RightSidebar.tsx` | Create | Right column wrapper |
| `apps/web/src/components/shared/TabBar.tsx` | Create | Reusable tab bar with gold underline |
| `apps/web/src/components/shared/LevelSlider.tsx` | Create | Range slider 1-18 with large number display |
| `apps/web/src/components/shared/HealthBar.tsx` | Create | HP/mana bar with base+bonus segments |
| `apps/web/src/components/champion/ChampionGrid.tsx` | Create | 3x2 quick-pick grid |
| `apps/web/src/components/champion/ChampionInfo.tsx` | Create | Selected champion details block |
| `apps/web/src/components/champion/ChampionHeader.tsx` | Create | Center top: portrait + bars + DPS |
| `apps/web/src/components/champion/EmptyState.tsx` | Create | "Select Your Champion" placeholder |
| `apps/web/src/components/champion/ChampionSelectModal.tsx` | Create | Full champion picker modal |
| `apps/web/src/components/stats/StatsTable.tsx` | Create | Two-column stat grid |
| `apps/web/src/components/stats/AbilitiesTab.tsx` | Create | "Coming soon" placeholder |
| `apps/web/src/components/stats/BreakdownTab.tsx` | Create | "Coming soon" placeholder |
| `apps/web/src/components/target/TargetPanel.tsx` | Create | Right sidebar content wrapper |
| `apps/web/src/components/target/TargetViewTabs.tsx` | Create | Champion/Synergy/Counter tabs (visual only) |
| `apps/web/src/components/target/DummyTarget.tsx` | Create | Custom HP/Armor/MR inputs |
| `apps/web/src/components/target/ChampionTarget.tsx` | Create | Stub for Phase 4 |
| `apps/web/src/components/target/MonsterTarget.tsx` | Create | Stub for Phase 4 |

---

## Task 1: Theme & Fonts

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Update Tailwind theme tokens in globals.css**

Replace the entire `@theme` block and body styles:

```css
@import "tailwindcss";

@theme {
  /* Background */
  --color-dark-600: #0a0e1a;
  --color-dark-500: #111827;
  --color-dark-400: #1a1f2e;
  --color-dark-300: #242938;
  --color-dark-200: #1f2937;
  --color-dark-100: #9CA3AF;
  --color-dark-50: #6B7280;

  /* Gold */
  --color-gold-100: #F0E6D2;
  --color-gold-200: #e8c870;
  --color-gold-300: #C89B3C;
  --color-gold-400: #C89B3C;
  --color-gold-500: #A07D3A;
  --color-gold-600: #785A28;
  --color-gold-glow: #C89B3C33;

  /* Damage types */
  --color-dmg-physical: #FF7043;
  --color-dmg-magic: #4FC3F7;
  --color-dmg-true: #E8E8E8;

  /* Stat colors */
  --color-stat-health: #66BB6A;
  --color-stat-armor: #FFB74D;
  --color-stat-mr: #CE93D8;
  --color-stat-as: #FFF176;
  --color-stat-crit: #F44336;
  --color-stat-ms: #81D4FA;

  /* Status */
  --color-error: #EF4444;
  --color-success: #22C55E;
  --color-warning: #F59E0B;

  /* Blue */
  --color-blue-200: #5b99d4;
  --color-blue-400: #0a5ec7;
  --color-blue-500: #0a3c6b;

  /* Mana */
  --color-stat-mana: #5b99d4;

  /* Fonts */
  --font-logo: var(--font-russo-one);
  --font-ui: var(--font-chakra-petch);
}

body {
  background-color: var(--color-dark-600);
  color: var(--color-dark-100);
  font-family: var(--font-ui), system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 2: Add Google Fonts to layout.tsx**

```tsx
import type { Metadata } from "next";
import { Russo_One, Chakra_Petch } from "next/font/google";
import "./globals.css";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo-one",
});

const chakraPetch = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra-petch",
});

export const metadata: Metadata = {
  title: "LoL Damage Simulator",
  description:
    "Calculate champion damage output against configurable targets. Real-time DPS, combo damage, and time-to-kill breakdowns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${russoOne.variable} ${chakraPetch.variable}`}>
      <body className="min-h-screen bg-dark-600 text-dark-100 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the app starts**

Run: `cd apps/web && pnpm dev`

Expected: App loads without errors. Background is dark navy (#0a0e1a). Text is light gray.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/layout.tsx
git commit -m "feat: update Tailwind theme and fonts to match mockup"
```

---

## Task 2: Zustand Stores

**Files:**
- Create: `apps/web/src/stores/useDataStore.ts`
- Create: `apps/web/src/stores/useSimulatorStore.ts`

- [ ] **Step 1: Create useDataStore**

```typescript
"use client";

import { create } from "zustand";
import type { Champion, Item } from "@lol-sim/types";

interface DataStore {
  champions: Champion[];
  items: Item[];
  patchVersion: string;
  setData: (champions: Champion[], items: Item[], patchVersion: string) => void;
  getChampion: (id: string) => Champion | undefined;
  getItem: (id: number) => Item | undefined;
}

export const useDataStore = create<DataStore>((set, get) => ({
  champions: [],
  items: [],
  patchVersion: "",
  setData: (champions, items, patchVersion) => set({ champions, items, patchVersion }),
  getChampion: (id) => get().champions.find((c) => c.riotId === id),
  getItem: (id) => get().items.find((i) => i.riotId === id),
}));
```

- [ ] **Step 2: Create useSimulatorStore**

```typescript
"use client";

import { create } from "zustand";

interface SimulatorStore {
  // Attacker
  selectedChampionId: string | null;
  level: number;
  itemIds: number[];
  abilityRanks: Record<string, number>;

  // Target
  targetMode: "custom" | "champion" | "monster";
  customTarget: { hp: number; armor: number; mr: number };
  targetChampionId: string | null;
  targetLevel: number;
  monsterType: string | null;

  // UI
  activeTab: "stats" | "abilities" | "breakdown";
  isChampionSelectOpen: boolean;

  // Actions
  setChampion: (id: string) => void;
  setLevel: (level: number) => void;
  setActiveTab: (tab: "stats" | "abilities" | "breakdown") => void;
  setTargetMode: (mode: "custom" | "champion" | "monster") => void;
  setCustomTarget: (stats: Partial<{ hp: number; armor: number; mr: number }>) => void;
  setChampionSelectOpen: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedChampionId: null,
  level: 1,
  itemIds: [] as number[],
  abilityRanks: {} as Record<string, number>,
  targetMode: "custom" as const,
  customTarget: { hp: 2000, armor: 100, mr: 100 },
  targetChampionId: null,
  targetLevel: 1,
  monsterType: null,
  activeTab: "stats" as const,
  isChampionSelectOpen: false,
};

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  ...initialState,

  setChampion: (id) => set({ selectedChampionId: id }),
  setLevel: (level) => set({ level: Math.max(1, Math.min(18, level)) }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTargetMode: (mode) => set({ targetMode: mode }),
  setCustomTarget: (stats) =>
    set((state) => ({
      customTarget: { ...state.customTarget, ...stats },
    })),
  setChampionSelectOpen: (open) => set({ isChampionSelectOpen: open }),
  reset: () => set(initialState),
}));
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/stores/
git commit -m "feat: add Zustand stores for data catalog and simulator state"
```

---

## Task 3: Simulation Result Hook

**Files:**
- Create: `apps/web/src/hooks/useSimulationResult.ts`

- [ ] **Step 1: Create useSimulationResult hook**

```typescript
"use client";

import { useMemo } from "react";
import { useDataStore } from "../stores/useDataStore";
import { useSimulatorStore } from "../stores/useSimulatorStore";
import {
  mergeStats,
  aggregateItemStats,
  calcAutoAttackDamage,
  calcTimeToKillAutoOnly,
  calcEffectiveResist,
  calcChampionStats,
} from "@lol-sim/engine";
import type { FinalStats } from "@lol-sim/types";

interface SimulationResultData {
  stats: FinalStats | null;
  baseStats: FinalStats | null;
  autoAttack: {
    raw: number;
    final: number;
    dps: number;
    effectiveArmor: number;
  } | null;
  timeToKill: {
    autoOnly: number;
  } | null;
  effectiveHP: {
    physical: number;
    magic: number;
    true: number;
  } | null;
}

export function useSimulationResult(): SimulationResultData {
  const getChampion = useDataStore((s) => s.getChampion);
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const customTarget = useSimulatorStore((s) => s.customTarget);

  return useMemo(() => {
    if (!selectedChampionId) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const champion = getChampion(selectedChampionId);
    if (!champion) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const emptyItemStats = aggregateItemStats([]);
    const stats = mergeStats(champion.baseStats, level, emptyItemStats);
    const baseStats = calcChampionStats(champion.baseStats, level);

    const target = {
      hp: customTarget.hp,
      armor: customTarget.armor,
      mr: customTarget.mr,
    };

    const autoAttack = calcAutoAttackDamage(stats, level, target);
    const timeToKillAutoOnly = calcTimeToKillAutoOnly(stats, level, target);

    const effectiveArmor = calcEffectiveResist({
      baseResist: target.armor,
      lethality: stats.lethality,
      percentPen: stats.armorPen,
    });
    const effectiveMR = calcEffectiveResist({
      baseResist: target.mr,
      flatMagicPen: stats.magicPen,
      percentPen: stats.magicPenPercent,
    });

    return {
      stats,
      baseStats,
      autoAttack,
      timeToKill: { autoOnly: timeToKillAutoOnly },
      effectiveHP: {
        physical: target.hp * (1 + effectiveArmor / 100),
        magic: target.hp * (1 + effectiveMR / 100),
        true: target.hp,
      },
    };
  }, [selectedChampionId, level, customTarget, getChampion]);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/
git commit -m "feat: add useSimulationResult hook with engine integration"
```

---

## Task 4: Layout Shell & Data Fetching

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/loading.tsx`
- Create: `apps/web/src/components/SimulatorPage.tsx`
- Create: `apps/web/src/components/layout/TopBar.tsx`
- Create: `apps/web/src/components/layout/LeftSidebar.tsx`
- Create: `apps/web/src/components/layout/CenterPanel.tsx`
- Create: `apps/web/src/components/layout/RightSidebar.tsx`

- [ ] **Step 1: Create loading.tsx**

```tsx
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-dark-600">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-dark-300 border-t-gold-300" />
    </div>
  );
}
```

- [ ] **Step 2: Create TopBar**

```tsx
"use client";

import { useDataStore } from "../../stores/useDataStore";
import { Search, User } from "lucide-react";

export function TopBar() {
  const patchVersion = useDataStore((s) => s.patchVersion);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-dark-200 bg-dark-500 px-6">
      <span className="font-logo text-lg text-gold-300">LoL Sim</span>
      <span className="text-xs font-medium text-dark-50">
        Patch v{patchVersion}
      </span>
      <div className="flex items-center gap-3">
        <button className="text-dark-50 hover:text-dark-100">
          <Search size={16} />
        </button>
        <button className="text-dark-50 hover:text-dark-100">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create LeftSidebar, CenterPanel, RightSidebar shells**

`LeftSidebar.tsx`:
```tsx
export function LeftSidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-dark-200 bg-dark-500 p-4">
      {children}
    </aside>
  );
}
```

`CenterPanel.tsx`:
```tsx
export function CenterPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5 px-6">
      {children}
    </main>
  );
}
```

`RightSidebar.tsx`:
```tsx
export function RightSidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-dark-200 bg-dark-500 p-4">
      {children}
    </aside>
  );
}
```

- [ ] **Step 4: Create SimulatorPage client component**

```tsx
"use client";

import { useEffect } from "react";
import type { Champion, Item } from "@lol-sim/types";
import { useDataStore } from "../stores/useDataStore";
import { TopBar } from "./layout/TopBar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterPanel } from "./layout/CenterPanel";
import { RightSidebar } from "./layout/RightSidebar";

interface SimulatorPageProps {
  champions: Champion[];
  items: Item[];
  patchVersion: string;
}

export function SimulatorPage({ champions, items, patchVersion }: SimulatorPageProps) {
  const setData = useDataStore((s) => s.setData);

  useEffect(() => {
    setData(champions, items, patchVersion);
  }, [champions, items, patchVersion, setData]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar>
          <p className="text-dark-50">Left sidebar</p>
        </LeftSidebar>
        <CenterPanel>
          <p className="text-dark-50">Center panel</p>
        </CenterPanel>
        <RightSidebar>
          <p className="text-dark-50">Right sidebar</p>
        </RightSidebar>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update page.tsx to fetch data and render SimulatorPage**

```tsx
import { DataClient, fetchAllChampions, fetchAllItems } from "@lol-sim/ddragon";
import { SimulatorPage } from "../components/SimulatorPage";

export default async function Home() {
  try {
    const client = new DataClient();
    const version = await client.getLatestVersion();
    const [champions, items] = await Promise.all([
      fetchAllChampions(client, version),
      fetchAllItems(client, version),
    ]);

    return <SimulatorPage champions={champions} items={items} patchVersion={version} />;
  } catch {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-600">
        <div className="text-center">
          <p className="text-xl text-gold-300">Failed to load game data</p>
          <p className="mt-2 text-dark-50">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }
}
```

- [ ] **Step 6: Verify 3-column layout renders**

Run: `cd apps/web && pnpm dev`

Expected: TopBar with "LoL Sim" logo and patch version. Three columns visible with placeholder text. Dark theme applied correctly.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/ apps/web/src/components/SimulatorPage.tsx apps/web/src/components/layout/
git commit -m "feat: add 3-column layout shell with server-side data fetching"
```

---

## Task 5: Shared Components

**Files:**
- Create: `apps/web/src/components/shared/TabBar.tsx`
- Create: `apps/web/src/components/shared/LevelSlider.tsx`
- Create: `apps/web/src/components/shared/HealthBar.tsx`

- [ ] **Step 1: Create TabBar**

```tsx
"use client";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex gap-1 border-b border-dark-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-gold-300 text-gold-300"
              : tab.disabled
                ? "cursor-not-allowed text-dark-50"
                : "text-dark-100 hover:text-gold-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create LevelSlider**

```tsx
"use client";

interface LevelSliderProps {
  level: number;
  onLevelChange: (level: number) => void;
  label?: string;
}

export function LevelSlider({ level, onLevelChange, label = "LEVEL" }: LevelSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={18}
          value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-dark-300 accent-gold-300"
        />
        <span className="min-w-[2ch] text-right font-ui text-4xl font-bold text-gold-300">
          {level}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create HealthBar**

```tsx
interface HealthBarProps {
  current: number;
  max: number;
  color: string;
  label?: string;
}

export function HealthBar({ current, max, color, label }: HealthBarProps) {
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="w-8 text-xs font-medium text-dark-50">{label}</span>
      )}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="min-w-[4ch] text-right text-xs text-dark-100">
        {Math.round(current)}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/shared/
git commit -m "feat: add shared TabBar, LevelSlider, and HealthBar components"
```

---

## Task 6: Left Sidebar — Champion Selection

**Files:**
- Create: `apps/web/src/components/champion/ChampionGrid.tsx`
- Create: `apps/web/src/components/champion/ChampionInfo.tsx`
- Modify: `apps/web/src/components/SimulatorPage.tsx`
- Modify: `apps/web/src/components/layout/LeftSidebar.tsx`

- [ ] **Step 1: Create ChampionGrid**

```tsx
"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function ChampionGrid() {
  const champions = useDataStore((s) => s.champions);
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const setChampion = useSimulatorStore((s) => s.setChampion);

  const displayed = champions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayed.map((champ) => (
        <button
          key={champ.riotId}
          onClick={() => setChampion(champ.riotId)}
          className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
            selectedChampionId === champ.riotId
              ? "border-gold-300"
              : "border-dark-200 hover:border-dark-100"
          }`}
        >
          <Image
            src={champ.imageUrl}
            alt={champ.name}
            fill
            sizes="80px"
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
              (e.target as HTMLImageElement).style.background = "#242938";
            }}
          />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ChampionInfo**

```tsx
"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function ChampionInfo() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const getChampion = useDataStore((s) => s.getChampion);

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-300">
          <span className="text-2xl text-dark-50">?</span>
        </div>
        <span className="text-sm font-medium text-dark-50">No Champion</span>
        <span className="text-xs text-dark-50">Select a champion</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold-600">
        <Image
          src={champion.imageUrl}
          alt={champion.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gold-100">{champion.name}</p>
        <span className="inline-block rounded bg-dark-300 px-2 py-0.5 text-xs text-dark-100">
          {champion.role}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire LeftSidebar with champion components and level slider**

Update `LeftSidebar.tsx` to be a concrete component (not a wrapper):

```tsx
"use client";

import { ChampionGrid } from "../champion/ChampionGrid";
import { ChampionInfo } from "../champion/ChampionInfo";
import { LevelSlider } from "../shared/LevelSlider";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { Search } from "lucide-react";

export function LeftSidebar() {
  const level = useSimulatorStore((s) => s.level);
  const setLevel = useSimulatorStore((s) => s.setLevel);
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-dark-200 bg-dark-500 p-4">
      {/* Search bar */}
      <button
        onClick={() => setChampionSelectOpen(true)}
        className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2 text-sm text-dark-50 hover:bg-dark-300"
      >
        <Search size={14} />
        <span>Search champion...</span>
      </button>

      {/* Champion quick-pick grid */}
      <ChampionGrid />

      {/* Selected champion info */}
      <ChampionInfo />

      {/* Level slider */}
      <LevelSlider level={level} onLevelChange={setLevel} />

      {/* Runes placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Runes</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Summoner Spells placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
          Summoner Spells
        </span>
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Items placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Items</span>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded bg-dark-300" />
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Update SimulatorPage to use LeftSidebar directly**

Remove children prop pattern — LeftSidebar is now self-contained. Update SimulatorPage to render `<LeftSidebar />` without children.

- [ ] **Step 5: Verify champion grid and selection**

Run dev server. Click a champion portrait — it should get a gold border. ChampionInfo should update to show name and role. Level slider should work 1-18.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/champion/ apps/web/src/components/layout/LeftSidebar.tsx apps/web/src/components/SimulatorPage.tsx
git commit -m "feat: add left sidebar with champion grid, info, and level slider"
```

---

## Task 7: Center Panel — Empty State & Champion Header

**Files:**
- Create: `apps/web/src/components/champion/EmptyState.tsx`
- Create: `apps/web/src/components/champion/ChampionHeader.tsx`
- Modify: `apps/web/src/components/layout/CenterPanel.tsx`

- [ ] **Step 1: Create EmptyState**

```tsx
"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function EmptyState() {
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {/* Decorative icon with gold glow */}
      <div className="relative">
        <div className="absolute inset-0 -m-8 rounded-full bg-gold-glow blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-600 bg-dark-400">
          <svg
            className="h-12 w-12 animate-spin text-gold-300"
            style={{ animationDuration: "8s" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
            <path d="M12 6a6 6 0 1 0 6 6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gold-100">Select Your Champion</h2>
        <p className="mt-2 text-sm text-dark-50">
          Choose a champion from the sidebar or use the search to find your main
        </p>
      </div>
      <button
        onClick={() => setChampionSelectOpen(true)}
        className="rounded-md border border-gold-600 bg-dark-400 px-6 py-2.5 text-sm font-medium text-gold-300 transition-colors hover:bg-dark-300"
      >
        Click a champion tile or use the select bar
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create ChampionHeader**

```tsx
"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { HealthBar } from "../shared/HealthBar";

export function ChampionHeader() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const getChampion = useDataStore((s) => s.getChampion);
  const { stats, autoAttack } = useSimulationResult();

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion || !stats) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-dark-400 p-4">
      {/* Portrait */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-gold-600">
        <Image
          src={champion.imageUrl}
          alt={champion.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Name + bars */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-gold-100">{champion.name}</h1>
          <span className="text-xs text-dark-50">
            Lv{level} {champion.role}
          </span>
        </div>
        <HealthBar current={stats.hp} max={stats.hp} color="var(--color-stat-health)" label="HP" />
        <HealthBar current={stats.mp} max={stats.mp} color="var(--color-stat-mana)" label="MP" />
      </div>

      {/* DPS */}
      <div className="shrink-0 text-right">
        <p className="font-ui text-4xl font-bold text-gold-300">
          {autoAttack ? Math.round(autoAttack.dps).toLocaleString() : "—"}
        </p>
        <p className="text-xs text-dark-50">Damage per second</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update CenterPanel to be self-contained**

```tsx
"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { EmptyState } from "../champion/EmptyState";
import { ChampionHeader } from "../champion/ChampionHeader";
import { TabBar } from "../shared/TabBar";
import { StatsTable } from "../stats/StatsTable";
import { AbilitiesTab } from "../stats/AbilitiesTab";
import { BreakdownTab } from "../stats/BreakdownTab";

const TABS = [
  { id: "stats", label: "Stats" },
  { id: "abilities", label: "Abilities", disabled: true },
  { id: "breakdown", label: "Breakdown", disabled: true },
];

export function CenterPanel() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const activeTab = useSimulatorStore((s) => s.activeTab);
  const setActiveTab = useSimulatorStore((s) => s.setActiveTab);

  if (!selectedChampionId) {
    return (
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5 px-6">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5 px-6">
      <ChampionHeader />
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as "stats" | "abilities" | "breakdown")}
      />
      {activeTab === "stats" && <StatsTable />}
      {activeTab === "abilities" && <AbilitiesTab />}
      {activeTab === "breakdown" && <BreakdownTab />}
    </main>
  );
}
```

**IMPORTANT:** CenterPanel imports StatsTable, AbilitiesTab, and BreakdownTab. All three must exist before CenterPanel compiles.

- [ ] **Step 4: Create StatsTable, AbilitiesTab, and BreakdownTab placeholders**

`StatsTable.tsx` (placeholder — will be replaced in Task 8):
```tsx
export function StatsTable() {
  return <div className="text-sm text-dark-50">Loading stats...</div>;
}
```

`AbilitiesTab.tsx`:
```tsx
export function AbilitiesTab() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-dark-50">Abilities — Coming soon</p>
    </div>
  );
}
```

`BreakdownTab.tsx`:
```tsx
export function BreakdownTab() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-dark-50">Breakdown — Coming soon</p>
    </div>
  );
}
```

- [ ] **Step 5: Update SimulatorPage to use self-contained layout components**

```tsx
"use client";

import { useEffect } from "react";
import type { Champion, Item } from "@lol-sim/types";
import { useDataStore } from "../stores/useDataStore";
import { TopBar } from "./layout/TopBar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterPanel } from "./layout/CenterPanel";
import { RightSidebar } from "./layout/RightSidebar";

interface SimulatorPageProps {
  champions: Champion[];
  items: Item[];
  patchVersion: string;
}

export function SimulatorPage({ champions, items, patchVersion }: SimulatorPageProps) {
  const setData = useDataStore((s) => s.setData);

  useEffect(() => {
    setData(champions, items, patchVersion);
  }, [champions, items, patchVersion, setData]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <CenterPanel />
        <RightSidebar />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify empty state and champion header**

With no champion selected: empty state visible with gold glow, "Select Your Champion" text.
After selecting a champion: header appears with portrait, HP/mana bars, DPS number. Tab bar shows Stats active.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/
git commit -m "feat: add center panel with empty state, champion header, and tab bar"
```

---

## Task 8: Stats Table

**Files:**
- Create: `apps/web/src/components/stats/StatsTable.tsx`

- [ ] **Step 1: Create StatsTable**

```tsx
"use client";

import { useSimulationResult } from "../../hooks/useSimulationResult";

interface StatRow {
  label: string;
  value: number;
  baseValue?: number;
  format?: "number" | "percent" | "decimal";
}

function formatStat(value: number, format: "number" | "percent" | "decimal" = "number"): string {
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "decimal") return value.toFixed(2);
  return Math.round(value).toLocaleString();
}

function StatRowDisplay({ label, value, baseValue, format = "number" }: StatRow) {
  const bonus = baseValue !== undefined ? value - baseValue : 0;
  const hasBonus = bonus > 0;

  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-sm text-dark-50">{label}</span>
      <span className="text-sm font-medium text-dark-100">
        {formatStat(value, format)}
        {hasBonus && (
          <span className="ml-1 text-stat-health">(+{formatStat(bonus, format)})</span>
        )}
      </span>
    </div>
  );
}

export function StatsTable() {
  const { stats, baseStats } = useSimulationResult();

  if (!stats || !baseStats) return null;

  const leftColumn: StatRow[] = [
    { label: "Attack Damage", value: stats.ad, baseValue: baseStats.ad },
    { label: "Health", value: stats.hp, baseValue: baseStats.hp },
    { label: "Armor", value: stats.armor, baseValue: baseStats.armor },
    { label: "Attack Speed", value: stats.attackSpeed, format: "decimal" },
    { label: "Crit Chance", value: stats.critChance, format: "percent" },
    { label: "Lethality", value: stats.lethality },
    { label: "Ability Haste", value: stats.abilityHaste },
    { label: "Armor Pen%", value: stats.armorPen, format: "percent" },
  ];

  const rightColumn: StatRow[] = [
    { label: "Ability Power", value: stats.ap },
    { label: "Mana", value: stats.mp, baseValue: baseStats.mp },
    { label: "Magic Resist", value: stats.mr, baseValue: baseStats.mr },
    { label: "Ability Haste", value: stats.abilityHaste },
    { label: "On-hit Dmg", value: 0 },
    { label: "Flat Magic Pen", value: stats.magicPen },
    { label: "Magic Pen%", value: stats.magicPenPercent, format: "percent" },
    { label: "Move Speed", value: stats.moveSpeed },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div className="flex flex-col">
        {leftColumn.map((row, i) => (
          <div key={row.label} className={i % 2 === 0 ? "bg-dark-400/50 rounded" : ""}>
            <StatRowDisplay {...row} />
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {rightColumn.map((row, i) => (
          <div key={row.label} className={i % 2 === 0 ? "bg-dark-400/50 rounded" : ""}>
            <StatRowDisplay {...row} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify stats table**

Select a champion. Stats tab should show two columns of stats. Change level — values should update in real-time.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/stats/StatsTable.tsx
git commit -m "feat: add stats table with real-time engine calculations"
```

---

## Task 9: Right Sidebar — Target Panel

**Files:**
- Create: `apps/web/src/components/target/TargetPanel.tsx`
- Create: `apps/web/src/components/target/TargetViewTabs.tsx`
- Create: `apps/web/src/components/target/DummyTarget.tsx`
- Create: `apps/web/src/components/target/ChampionTarget.tsx`
- Create: `apps/web/src/components/target/MonsterTarget.tsx`
- Modify: `apps/web/src/components/layout/RightSidebar.tsx`

- [ ] **Step 1: Create TargetViewTabs**

```tsx
"use client";

import { useState } from "react";

const VIEW_TABS = [
  { id: "champion", label: "Champion" },
  { id: "synergy", label: "Synergy" },
  { id: "counter", label: "Counter" },
];

export function TargetViewTabs() {
  const [activeView, setActiveView] = useState("champion");

  return (
    <div className="flex gap-1 rounded-lg bg-dark-400 p-1">
      {VIEW_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveView(tab.id)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeView === tab.id
              ? "bg-dark-300 text-gold-300"
              : "text-dark-50 hover:text-dark-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create DummyTarget**

```tsx
"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";

interface StatInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color: string;
  barMax?: number;
}

function StatInput({ label, value, onChange, min = 0, max = 99999, color, barMax = 300 }: StatInputProps) {
  const barPercent = Math.min(100, (value / barMax) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-dark-50">{label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-20 rounded bg-dark-400 px-2 py-1 text-right text-sm text-dark-100 outline-none focus:ring-1 focus:ring-gold-300"
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barPercent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function DummyTarget() {
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const setCustomTarget = useSimulatorStore((s) => s.setCustomTarget);

  return (
    <div className="flex flex-col gap-3">
      {/* Target identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-300">
          <span className="text-lg text-dark-50">D</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold-100">Dummy</p>
          <p className="text-xs text-dark-50">Custom target</p>
        </div>
      </div>

      {/* Stat inputs */}
      <StatInput
        label="HP"
        value={customTarget.hp}
        onChange={(hp) => setCustomTarget({ hp })}
        min={1}
        max={99999}
        color="var(--color-stat-health)"
        barMax={5000}
      />
      <StatInput
        label="Armor"
        value={customTarget.armor}
        onChange={(armor) => setCustomTarget({ armor })}
        max={1000}
        color="var(--color-stat-armor)"
      />
      <StatInput
        label="Magic Resist"
        value={customTarget.mr}
        onChange={(mr) => setCustomTarget({ mr })}
        max={1000}
        color="var(--color-stat-mr)"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create ChampionTarget and MonsterTarget stubs**

`ChampionTarget.tsx`:
```tsx
export function ChampionTarget() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <p className="text-sm text-dark-50">Champion target — Coming in Phase 4</p>
    </div>
  );
}
```

`MonsterTarget.tsx`:
```tsx
export function MonsterTarget() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <p className="text-sm text-dark-50">Monster target — Coming in Phase 4</p>
    </div>
  );
}
```

- [ ] **Step 4: Create TargetPanel**

```tsx
"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { TargetViewTabs } from "./TargetViewTabs";
import { DummyTarget } from "./DummyTarget";
import { LevelSlider } from "../shared/LevelSlider";

export function TargetPanel() {
  const level = useSimulatorStore((s) => s.level);
  const { autoAttack, timeToKill, effectiveHP } = useSimulationResult();

  return (
    <div className="flex flex-col gap-3">
      <TargetViewTabs />
      <DummyTarget />

      {/* Level (mirrors attacker level for dummy) */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Level</span>
        <span className="text-2xl font-bold text-gold-300">{level}</span>
      </div>

      {/* Runes placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Runes</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Effective HP */}
      {effectiveHP && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Effective HP
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-dmg-physical">vs Physical</span>
              <span className="text-dark-100">{Math.round(effectiveHP.physical).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dmg-magic">vs Magic</span>
              <span className="text-dark-100">{Math.round(effectiveHP.magic).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dmg-true">vs True</span>
              <span className="text-dark-100">{Math.round(effectiveHP.true).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Damage Mix bar */}
      {autoAttack && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Damage Mix
          </span>
          <div className="flex h-2 overflow-hidden rounded-full">
            <div className="h-full bg-dmg-physical" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dmg-physical">Physical 100%</span>
          </div>
        </div>
      )}

      {/* Time to Kill */}
      {timeToKill && autoAttack && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Time to Kill
          </span>
          <p className="font-ui text-3xl font-bold text-gold-300">
            {Number.isFinite(timeToKill.autoOnly)
              ? `${timeToKill.autoOnly.toFixed(1)}s`
              : "—"}
          </p>
          <p className="text-xs text-dark-50">
            Auto attacks · {Math.round(autoAttack.dps)} DPS
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Update RightSidebar**

```tsx
import { TargetPanel } from "../target/TargetPanel";

export function RightSidebar() {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-dark-200 bg-dark-500 p-4">
      <TargetPanel />
    </aside>
  );
}
```

- [ ] **Step 6: Verify target panel**

Select a champion. Right sidebar should show: view tabs, dummy target inputs (HP/Armor/MR with bars), level display, effective HP values, time to kill. Changing target stats should update effective HP and TTK in real-time.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/target/ apps/web/src/components/layout/RightSidebar.tsx
git commit -m "feat: add right sidebar with dummy target panel and combat results"
```

---

## Task 10: Champion Select Modal

**Files:**
- Create: `apps/web/src/components/champion/ChampionSelectModal.tsx`
- Modify: `apps/web/src/components/SimulatorPage.tsx`

- [ ] **Step 1: Create ChampionSelectModal**

```tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";

const ROLES = ["All", "Fighter", "Tank", "Mage", "Marksman", "Assassin", "Support"];

export function ChampionSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isChampionSelectOpen);
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);
  const setChampion = useSimulatorStore((s) => s.setChampion);
  const champions = useDataStore((s) => s.champions);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const filtered = useMemo(() => {
    return champions
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole =
          selectedRole === "All" ||
          c.role.toLowerCase().includes(selectedRole.toLowerCase());
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [champions, search, selectedRole]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    setChampion(id);
    setChampionSelectOpen(false);
    setSearch("");
    setSelectedRole("All");
  };

  const handleRandom = () => {
    if (champions.length === 0) return;
    const random = champions[Math.floor(Math.random() * champions.length)];
    handleSelect(random.riotId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[80vh] w-[560px] flex-col rounded-xl border border-dark-200 bg-dark-500">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold-100">
            Select Champion
          </h2>
          <button
            onClick={() => setChampionSelectOpen(false)}
            className="text-dark-50 hover:text-dark-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2">
            <Search size={14} className="text-dark-50" />
            <input
              type="text"
              placeholder="Search champion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-dark-100 outline-none placeholder:text-dark-50"
              autoFocus
            />
          </div>
        </div>

        {/* Role filters */}
        <div className="flex flex-wrap gap-1 px-6 pt-3">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedRole === role
                  ? "bg-gold-300 text-dark-600"
                  : "bg-dark-300 text-dark-100 hover:bg-dark-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Champion grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-5 gap-3">
            {filtered.map((champ) => (
              <button
                key={champ.riotId}
                onClick={() => handleSelect(champ.riotId)}
                className="group flex flex-col items-center gap-1"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md border-2 border-dark-200 transition-colors group-hover:border-gold-300">
                  <Image
                    src={champ.imageUrl}
                    alt={champ.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs text-dark-50 group-hover:text-gold-100">
                  {champ.name}
                </span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-dark-50">No champions found</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-200 px-6 py-3 text-center">
          <button
            onClick={handleRandom}
            className="text-xs text-dark-50 hover:text-gold-300"
          >
            Or use random champion
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add modal to SimulatorPage**

Add `<ChampionSelectModal />` at the end of the SimulatorPage JSX, after the layout div:

```tsx
import { ChampionSelectModal } from "./champion/ChampionSelectModal";

// In the return:
return (
  <div className="flex h-screen flex-col">
    <TopBar />
    <div className="flex min-h-0 flex-1">
      <LeftSidebar />
      <CenterPanel />
      <RightSidebar />
    </div>
    <ChampionSelectModal />
  </div>
);
```

- [ ] **Step 3: Verify modal**

Click search bar in left sidebar or empty state CTA — modal opens. Type in search — filters champions. Click role pill — filters by role. Click a champion — selects it, modal closes. "Or use random" works.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/champion/ChampionSelectModal.tsx apps/web/src/components/SimulatorPage.tsx
git commit -m "feat: add champion select modal with search and role filtering"
```

---

## Task 11: Final Polish & Verification

- [ ] **Step 1: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: No TypeScript errors. Fix any type issues found.

- [ ] **Step 2: Run lint**

```bash
cd apps/web && pnpm lint
```

Expected: No lint errors. Fix any issues found.

- [ ] **Step 3: Run build**

```bash
cd apps/web && pnpm build
```

Expected: Build succeeds without errors.

- [ ] **Step 4: Manual E2E verification**

Run `pnpm dev` and verify:
1. Page loads with 3-column layout and dark theme
2. Empty state shows when no champion selected
3. Clicking champion in grid selects it, shows header + stats
4. Level slider updates stats in real-time
5. Champion select modal: search, role filter, random all work
6. Target panel: changing HP/armor/MR updates effective HP and TTK
7. Tab bar: Stats active, Abilities/Breakdown show "Coming soon"
8. Patch version shows in top bar

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish Phase 1 UI and resolve build issues"
```
