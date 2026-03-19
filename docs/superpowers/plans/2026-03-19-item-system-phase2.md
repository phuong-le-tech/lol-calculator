# Item System Phase 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add item equipping with a picker modal, stat recalculation, and passive badges to the LoL Damage Simulator.

**Architecture:** Extend the existing Zustand store with item state (6-slot array), update the `useSimulationResult` hook to include item stats in calculations, and add 5 new components for item UI (slots, modal, grid, detail, icon). The item select modal uses a split-panel layout matching the mockup.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand, `@lol-sim/engine` (for `aggregateItemStats`, `getPassive`), `@lol-sim/types` (for `Item`, `ItemStats`)

**Spec:** `docs/superpowers/specs/2026-03-19-item-system-phase2-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/stores/useSimulatorStore.ts` | Modify | Add item state + actions (addItem, removeItem, setItemSelectOpen) |
| `apps/web/src/hooks/useSimulationResult.ts` | Modify | Include equipped items in stat calculations |
| `apps/web/src/components/items/ItemIcon.tsx` | Create | Reusable item portrait with fallback |
| `apps/web/src/components/items/ItemSlots.tsx` | Create | 6 clickable item slots for left sidebar |
| `apps/web/src/components/items/ItemGrid.tsx` | Create | Filterable item grid (left panel of modal) |
| `apps/web/src/components/items/ItemDetail.tsx` | Create | Item stats + passives display (right panel of modal) |
| `apps/web/src/components/items/ItemSelectModal.tsx` | Create | Split-panel modal combining grid + detail |
| `apps/web/src/components/layout/LeftSidebar.tsx` | Modify | Replace item placeholder with ItemSlots |
| `apps/web/src/components/SimulatorPage.tsx` | Modify | Add ItemSelectModal |

---

## Task 1: Store & Hook Updates

**Files:**
- Modify: `apps/web/src/stores/useSimulatorStore.ts`
- Modify: `apps/web/src/hooks/useSimulationResult.ts`

- [ ] **Step 1: Update useSimulatorStore — add item state and actions**

Add to the `SimulatorStore` interface:

```typescript
// New state
isItemSelectOpen: boolean;
activeItemSlot: number | null;

// New actions
addItem: (slotIndex: number, itemId: number) => void;
removeItem: (slotIndex: number) => void;
setItemSelectOpen: (open: boolean, slotIndex?: number) => void;
```

Change `initialState.itemIds` from `[] as number[]` to `[0, 0, 0, 0, 0, 0] as number[]`.

Add to `initialState`:
```typescript
isItemSelectOpen: false,
activeItemSlot: null as number | null,
```

Add action implementations:
```typescript
addItem: (slotIndex, itemId) =>
  set((state) => {
    const newIds = [...state.itemIds];
    newIds[slotIndex] = itemId;
    return { itemIds: newIds };
  }),
removeItem: (slotIndex) =>
  set((state) => {
    const newIds = [...state.itemIds];
    newIds[slotIndex] = 0;
    return { itemIds: newIds };
  }),
setItemSelectOpen: (open, slotIndex) =>
  set({
    isItemSelectOpen: open,
    activeItemSlot: open ? (slotIndex ?? null) : null,
  }),
```

- [ ] **Step 2: Update useSimulationResult — include item stats**

Add new store selectors at the top of the hook:
```typescript
const itemIds = useSimulatorStore((s) => s.itemIds);
const getItem = useDataStore((s) => s.getItem);
```

Replace the item stats calculation inside `useMemo`:
```typescript
// Replace these 2 lines:
// const emptyItemStats = aggregateItemStats([]);
// const stats = mergeStats(champion.baseStats, level, emptyItemStats);

// With:
const equippedItems = itemIds
  .filter((id) => id !== 0)
  .map((id) => getItem(id))
  .filter((item): item is Item => item !== undefined);
const itemStats = aggregateItemStats(equippedItems.map((i) => i.stats));
const stats = mergeStats(champion.baseStats, level, itemStats);
```

Add `import type { Item } from "@lol-sim/types";` at the top.

Update the `useMemo` dependency array to include `itemIds` and `getItem`:
```typescript
}, [selectedChampionId, level, customTarget, itemIds, getChampion, getItem]);
```

- [ ] **Step 3: Verify typecheck passes**

Run: `pnpm --filter @lol-sim/web typecheck`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/stores/useSimulatorStore.ts apps/web/src/hooks/useSimulationResult.ts
git commit -m "feat: add item state to store and include items in stat calculations"
```

---

## Task 2: ItemIcon Component

**Files:**
- Create: `apps/web/src/components/items/ItemIcon.tsx`

- [ ] **Step 1: Create ItemIcon**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface ItemIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ItemIcon({ src, alt, size = 32, className = "" }: ItemIconProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-dark-300 text-dark-50 ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>?</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/items/ItemIcon.tsx
git commit -m "feat: add reusable ItemIcon component with error fallback"
```

---

## Task 3: ItemSlots Component

**Files:**
- Create: `apps/web/src/components/items/ItemSlots.tsx`
- Modify: `apps/web/src/components/layout/LeftSidebar.tsx`

- [ ] **Step 1: Create ItemSlots**

```tsx
"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import { X } from "lucide-react";

export function ItemSlots() {
  const itemIds = useSimulatorStore((s) => s.itemIds);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const removeItem = useSimulatorStore((s) => s.removeItem);
  const getItem = useDataStore((s) => s.getItem);

  const equippedItems = itemIds.map((id) => (id !== 0 ? getItem(id) : null));
  const totalCost = equippedItems.reduce((sum, item) => sum + (item?.cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Items</span>
      <div className="flex gap-2">
        {itemIds.map((id, i) => {
          const item = equippedItems[i];
          if (item) {
            return (
              <button
                key={i}
                onClick={() => setItemSelectOpen(true, i)}
                className="group relative overflow-hidden rounded border-2 border-gold-600"
              >
                <ItemIcon src={item.imageUrl} alt={item.name} size={32} />
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i);
                  }}
                >
                  <X size={14} className="text-dark-100" />
                </div>
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => setItemSelectOpen(true, i)}
              className="h-8 w-8 rounded bg-dark-300 transition-colors hover:bg-dark-200"
            />
          );
        })}
      </div>
      {totalCost > 0 && (
        <span className="text-xs text-dark-50">
          Build Cost: {totalCost.toLocaleString()}g
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update LeftSidebar — replace items placeholder with ItemSlots**

Replace the items placeholder section (lines 57-64) in `LeftSidebar.tsx`:

```tsx
// Replace:
{/* Items placeholder */}
<div className="flex flex-col gap-2">
  <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Items</span>
  <div className="flex gap-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-8 w-8 rounded bg-dark-300" />
    ))}
  </div>
</div>

// With:
<ItemSlots />
```

Add the import at the top:
```tsx
import { ItemSlots } from "../items/ItemSlots";
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/items/ItemSlots.tsx apps/web/src/components/layout/LeftSidebar.tsx
git commit -m "feat: add clickable item slots to left sidebar"
```

---

## Task 4: ItemGrid Component

**Files:**
- Create: `apps/web/src/components/items/ItemGrid.tsx`

- [ ] **Step 1: Create ItemGrid**

```tsx
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import type { Item } from "@lol-sim/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "damage", label: "AD" },
  { id: "magic", label: "AP" },
  { id: "hp", label: "HP" },
  { id: "attack_speed", label: "AS" },
  { id: "crit", label: "Crit" },
  { id: "defense", label: "Defense" },
];

interface ItemGridProps {
  selectedItemId: number | null;
  onSelectItem: (item: Item) => void;
}

export function ItemGrid({ selectedItemId, onSelectItem }: ItemGridProps) {
  const items = useDataStore((s) => s.items);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return items
      .filter((item) => item.isCompleted)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter((item) => {
        if (category === "all") return true;
        if (category === "hp") return (item.stats.hp ?? 0) > 0;
        if (category === "crit") return (item.stats.critChance ?? 0) > 0;
        return item.category === category;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, category]);

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2">
        <Search size={14} className="text-dark-50" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-dark-100 outline-none placeholder:text-dark-50"
          autoFocus
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat.id
                ? "bg-gold-300 text-dark-600"
                : "bg-dark-300 text-dark-100 hover:bg-dark-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((item) => (
            <button
              key={item.riotId}
              onClick={() => onSelectItem(item)}
              className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-colors ${
                selectedItemId === item.riotId
                  ? "border-gold-300 bg-dark-300"
                  : "border-dark-200 bg-dark-400 hover:border-dark-100"
              }`}
            >
              <ItemIcon
                src={item.imageUrl}
                alt={item.name}
                size={32}
                className="shrink-0 rounded"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-dark-100">{item.name}</p>
                <p className="text-xs text-gold-500">{item.cost}g</p>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-dark-50">No items found</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/items/ItemGrid.tsx
git commit -m "feat: add filterable item grid component"
```

---

## Task 5: ItemDetail Component

**Files:**
- Create: `apps/web/src/components/items/ItemDetail.tsx`

- [ ] **Step 1: Create ItemDetail**

```tsx
"use client";

import type { Item } from "@lol-sim/types";
import { getPassive } from "@lol-sim/engine";
import { ItemIcon } from "./ItemIcon";

const CATEGORY_LABELS: Record<string, string> = {
  damage: "Attack Damage",
  magic: "Ability Power",
  defense: "Defense",
  attack_speed: "Attack Speed",
  boots: "Boots",
  other: "Other",
};

const STAT_LABELS: Record<string, { label: string; format: "flat" | "percent" }> = {
  ad: { label: "Attack Damage", format: "flat" },
  ap: { label: "Ability Power", format: "flat" },
  hp: { label: "Health", format: "flat" },
  mana: { label: "Mana", format: "flat" },
  armor: { label: "Armor", format: "flat" },
  mr: { label: "Magic Resist", format: "flat" },
  attackSpeed: { label: "Attack Speed", format: "percent" },
  critChance: { label: "Critical Strike Chance", format: "percent" },
  lethality: { label: "Lethality", format: "flat" },
  armorPen: { label: "Armor Penetration", format: "percent" },
  magicPen: { label: "Magic Penetration", format: "flat" },
  magicPenPercent: { label: "Magic Pen %", format: "percent" },
  abilityHaste: { label: "Ability Haste", format: "flat" },
  lifeSteal: { label: "Life Steal", format: "percent" },
  omnivamp: { label: "Omnivamp", format: "percent" },
  moveSpeed: { label: "Move Speed", format: "flat" },
  moveSpeedPercent: { label: "Move Speed", format: "percent" },
};

interface ItemDetailProps {
  item: Item | null;
  onEquip: () => void;
}

export function ItemDetail({ item, onEquip }: ItemDetailProps) {
  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-dark-50">Select an item to view details</p>
      </div>
    );
  }

  const passive = getPassive(item.riotId);
  const nonZeroStats = Object.entries(item.stats).filter(
    ([, value]) => value !== undefined && value !== 0
  );

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <ItemIcon
          src={item.imageUrl}
          alt={item.name}
          size={64}
          className="shrink-0 rounded-lg"
        />
        <div>
          <h3 className="text-lg font-semibold text-gold-100">{item.name}</h3>
          <p className="text-sm text-gold-500">{item.cost.toLocaleString()}g</p>
          <span className="mt-1 inline-block rounded bg-dark-300 px-2 py-0.5 text-xs text-dark-100">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>
      </div>

      {/* Stats */}
      {nonZeroStats.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Stats</span>
          {nonZeroStats.map(([key, value]) => {
            const meta = STAT_LABELS[key];
            if (!meta) return null;
            const formatted =
              meta.format === "percent" ? `+${value}%` : `+${value}`;
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-dark-50">{meta.label}</span>
                <span className="text-dark-100">{formatted}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Passives */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Passives
          </span>
          {passive ? (
            <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
              SIMULATED
            </span>
          ) : (
            <span className="rounded-full bg-dark-300 px-2 py-0.5 text-xs font-medium text-dark-50">
              NOT SIMULATED
            </span>
          )}
        </div>
        {passive && (
          <p className="text-sm font-medium text-gold-100">{passive.name}</p>
        )}
        {item.description && (
          <p className="text-xs leading-relaxed text-dark-100">{item.description}</p>
        )}
      </div>

      {/* Equip button */}
      <button
        onClick={onEquip}
        className="mt-auto rounded-lg bg-gold-300 px-6 py-3 text-sm font-semibold text-dark-600 transition-colors hover:bg-gold-200"
      >
        Equip Item
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/items/ItemDetail.tsx
git commit -m "feat: add item detail panel with stats and passive badges"
```

---

## Task 6: ItemSelectModal & Integration

**Files:**
- Create: `apps/web/src/components/items/ItemSelectModal.tsx`
- Modify: `apps/web/src/components/SimulatorPage.tsx`

- [ ] **Step 1: Create ItemSelectModal**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import type { Item } from "@lol-sim/types";

export function ItemSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isItemSelectOpen);
  const activeSlot = useSimulatorStore((s) => s.activeItemSlot);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const addItem = useSimulatorStore((s) => s.addItem);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen || activeSlot === null) return null;

  const handleEquip = () => {
    if (!selectedItem) return;
    addItem(activeSlot, selectedItem.riotId);
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[80vh] w-[860px] flex-col overflow-hidden rounded-xl border border-dark-200 bg-dark-500">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold-100">
            Select Item
          </h2>
          <button onClick={handleClose} className="text-dark-50 hover:text-dark-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel — item grid */}
          <div className="flex w-[370px] shrink-0 flex-col border-r border-dark-200 p-4">
            <ItemGrid
              selectedItemId={selectedItem?.riotId ?? null}
              onSelectItem={setSelectedItem}
            />
          </div>

          {/* Right panel — item detail */}
          <div className="flex flex-1 flex-col bg-dark-400">
            <ItemDetail item={selectedItem} onEquip={handleEquip} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add ItemSelectModal to SimulatorPage**

Add import and render in `SimulatorPage.tsx`:

```tsx
import { ItemSelectModal } from "./items/ItemSelectModal";

// Add after <ChampionSelectModal /> in the JSX:
<ItemSelectModal />
```

- [ ] **Step 3: Verify everything works**

Run: `pnpm --filter @lol-sim/web typecheck`
Expected: No TypeScript errors.

Run: `pnpm --filter @lol-sim/web build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/items/ItemSelectModal.tsx apps/web/src/components/SimulatorPage.tsx
git commit -m "feat: add item select modal with split-panel layout"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run typecheck**

Run: `pnpm --filter @lol-sim/web typecheck`
Expected: No TypeScript errors.

- [ ] **Step 2: Run build**

Run: `pnpm --filter @lol-sim/web build`
Expected: Build succeeds.

- [ ] **Step 3: Manual verification**

Run dev server and verify:
1. Item slots show 6 empty squares in left sidebar
2. Click an empty slot → item select modal opens
3. Search filters items by name
4. Category pills filter items (AD, AP, HP, etc.)
5. Click an item → detail panel shows stats + passive badge
6. Click "Equip Item" → modal closes, item appears in slot
7. Hover filled slot → X overlay appears, click removes item
8. Stats table, DPS, TTK, effective HP all update when items change
9. Build cost shows below item slots

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish Phase 2 item system"
```
