# Item System — Phase 2 Design Spec

## Overview

Add item equipping to the simulator. Users click item slots in the left sidebar to open an item picker modal, browse/search items, view stats and passives, and equip items. Equipped items affect all stat calculations in real-time.

## Scope

- 6 clickable item slots in the left sidebar (replacing placeholders)
- Item picker modal with search, category filters, and split-panel detail view
- Stat recalculation when items are equipped (auto attack DPS, TTK, effective HP all update)
- Passive display with "Simulated" badges for engine-supported passives
- Click "Equip" → item fills slot → modal closes (one item at a time)

## File Structure

```
apps/web/src/
├── components/
│   ├── items/
│   │   ├── ItemSlots.tsx           # 6 clickable slots in left sidebar
│   │   ├── ItemSelectModal.tsx     # Split-panel modal (grid + detail)
│   │   ├── ItemGrid.tsx            # Filterable item grid (left panel)
│   │   ├── ItemDetail.tsx          # Item stats + passives (right panel)
│   │   └── ItemIcon.tsx            # Reusable item portrait
│   └── layout/
│       └── LeftSidebar.tsx         # Modified: use ItemSlots instead of placeholders
├── hooks/
│   └── useSimulationResult.ts      # Modified: include equipped items in calculations
└── stores/
    └── useSimulatorStore.ts        # Modified: add item management actions
```

## Store Changes

Add to `useSimulatorStore`:

```typescript
// IMPORTANT: Change initial value of itemIds from `[]` to `[0, 0, 0, 0, 0, 0]`.
// The array is always length 6. Each index is a slot position. 0 = empty.
itemIds: number[]   // initial: [0, 0, 0, 0, 0, 0]

// New state
isItemSelectOpen: boolean            // initial: false
activeItemSlot: number | null        // initial: null — which slot (0-5) triggered the modal

// New actions
addItem: (slotIndex: number, itemId: number) => void
removeItem: (slotIndex: number) => void
setItemSelectOpen: (open: boolean, slotIndex?: number) => void
```

`addItem` creates a new array copy with `itemIds[slotIndex] = itemId` (immutable update).

`removeItem` creates a new array copy with `itemIds[slotIndex] = 0`.

`setItemSelectOpen(true, 2)` opens the modal targeting slot 2. `setItemSelectOpen(false)` closes it and resets `activeItemSlot` to null.

## Calculation Changes

`useSimulationResult` currently does:
```typescript
const emptyItemStats = aggregateItemStats([]);
const stats = mergeStats(champion.baseStats, level, emptyItemStats);
```

With items — `useSimulationResult` must add `itemIds` to its store selectors and `useMemo` dependency array:
```typescript
// Add to store selectors at top of hook:
const itemIds = useSimulatorStore((s) => s.itemIds);
const getItem = useDataStore((s) => s.getItem);

// Inside useMemo (add itemIds + getItem to dependency array):
const equippedItems = itemIds
  .filter((id) => id !== 0)
  .map((id) => getItem(id))
  .filter((item): item is Item => item !== undefined);

// aggregateItemStats takes ItemStats[], NOT Item[] — must extract .stats
const itemStats = aggregateItemStats(equippedItems.map((i) => i.stats));
const stats = mergeStats(champion.baseStats, level, itemStats);
```

The `calcAutoAttackDamage`, `calcTimeToKillAutoOnly`, and `calcEffectiveResist` calls remain the same — they read from the merged `stats` which now includes item contributions.

For item passives that affect combat (e.g., Infinity Edge's crit damage bonus), the engine's `applyPassives` function handles this internally when `equippedItemIds` is passed to combo/damage functions. In Phase 2, auto attack damage will include passive effects by passing `equippedItemIds` to the combat functions that support it.

The `baseStats` (from `calcChampionStats`) stays item-free, so the StatsTable can show base vs total with bonus values in parentheses.

## Component Behavior

### ItemSlots

- Row of 6 square slots (32x32) in the left sidebar
- Empty slot: dark bg (`bg-dark-300`), click opens item select modal for that slot
- Filled slot: shows item icon via `next/image`, gold border
- Right-click or click an X overlay on filled slot removes the item
- Below slots: "Build Cost: {totalGold}" showing sum of equipped item costs

### ItemSelectModal

Split-panel modal (860px wide, 690px tall from mockup):

**Header:**
- "SELECT ITEM" title, close button (X)

**Left Panel (370px):**
- Search input: filters by item name (case-insensitive substring)
- Category filter tabs: All | AD | AP | HP | AS | Crit | Defense
  - Maps to `item.category`: "damage"→AD, "magic"→AP, "defense"→Defense, "attack_speed"→AS, "boots"→Other (shown under All)
  - "HP" and "Crit" filter by checking `item.stats.hp > 0` or `item.stats.critChance > 0`
- Item grid: 2-column grid of item cards showing icon, name, gold cost, and key stat
- Only completed items shown (`item.isCompleted === true`)
- Click an item → shows detail in right panel
- Selected item gets gold border

**Right Panel (fill):**
- Item image (large, from `item.imageUrl`)
- Item name (large text), gold cost
- Category tag pill showing `item.category` mapped to display name (e.g., "damage"→"Attack Damage", "magic"→"Ability Power", "defense"→"Defense", "attack_speed"→"Attack Speed", "boots"→"Boots", "other"→"Other")
- **STATS section:** List of non-zero stats from `item.stats` with stat name and value (e.g., "Attack Damage +70", "Critical Strike Chance +25%")
- **PASSIVES section:** The `Item` type has no `passives` field. Instead, check the engine's `PassiveRegistry` via `getPassive(item.riotId)`:
  - If `getPassive(item.riotId)` returns a `ItemPassiveDefinition`: show the passive name + "SIMULATED" badge (green, `color-success`)
  - If `getPassive(item.riotId)` returns `undefined`: show "NOT SIMULATED" badge (muted, `text-disabled`)
  - Always show `item.description` as the passive/effect text (this is the raw item description from Meraki, which contains passive info)
- **"Equip Item" button** at bottom: gold bg, fills the active slot, closes modal
- If no item selected: show placeholder "Select an item to view details"

### ItemIcon

Reusable component for displaying an item icon:
- `next/image` with the item's `imageUrl`
- Optional size prop (default 32px)
- Fallback placeholder on image error

## Engine Integration

| UI Element | Engine Function | Change from Phase 1 |
|---|---|---|
| Stats table | `mergeStats()` | Now passes real `ItemStats` instead of empty |
| Auto attack DPS | `calcAutoAttackDamage()` | Stats now include item bonuses |
| Time to kill | `calcTimeToKillAutoOnly()` | Stats now include item bonuses |
| Effective armor/MR | `calcEffectiveResist()` | Stats now include lethality/pen from items |
| Passive check | `getPassive(itemId)` | New: check if passive is simulated |

**Simulated passives** (from engine's `PassiveRegistry`):
- Infinity Edge (3031) — +40% crit damage
- Blade of the Ruined King (3153) — on-hit % current HP
- Kraken Slayer (6693) — physical on-hit bonus
- Lich Bane (3003) — AP scaling on-hit
- Nashor's Tooth (3115) — AP scaling on-hit
- Rabadon's Deathcap (3089) — AP multiplier
- Lord Dominik's (3036) — armor pen (stat-only)

## Styling

- Modal follows same dark theme as ChampionSelectModal
- Item cards: `bg-dark-400`, `border-dark-200`, hover `border-gold-300`
- Category tabs: pill-style like role filters in champion modal
- "Equip Item" button: `bg-gold-300 text-dark-600` (gold button, dark text)
- "SIMULATED" badge: `bg-color-success/20 text-color-success`, small rounded pill
- "NOT SIMULATED" badge: `bg-dark-300 text-dark-50`, small rounded pill
- Stat values in detail: white text, stat names in `text-dark-50`

## Non-Goals (Phase 2)

- Item passive effects on combo damage (Phase 3 will wire passives into combo simulation)
- Item recommendations or build suggestions
- Item set saving
- Duplicate item prevention (League allows some duplicates)
- Boot slot restrictions
