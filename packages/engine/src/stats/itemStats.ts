import type { ItemStats } from "@lol-sim/types";

/** Valid keys for ItemStats — used to guard against unexpected properties */
const VALID_KEYS = new Set<keyof ItemStats>([
  "ad", "ap", "hp", "mana", "armor", "mr", "attackSpeed", "critChance",
  "lethality", "armorPen", "magicPen", "magicPenPercent", "abilityHaste",
  "lifeSteal", "omnivamp", "moveSpeed", "moveSpeedPercent",
]);

/** Sum item stats from an array of items */
export function aggregateItemStats(items: ItemStats[]): ItemStats {
  const result: ItemStats = {};

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "number" && VALID_KEYS.has(key as keyof ItemStats)) {
        const k = key as keyof ItemStats;
        result[k] = ((result[k] as number) || 0) + value;
      }
    }
  }

  return result;
}
