import type { ItemStats, StatShard } from "@lol-sim/types";

/**
 * Aggregate stat shard bonuses into an ItemStats-compatible object.
 * Resolves "adaptiveForce" into AD or AP based on champion's adaptive type.
 *
 * @param shards - Selected stat shards (may contain nulls for unselected rows)
 * @param isAP - true if champion scales with AP (magic), false for AD (physical)
 */
export function aggregateRuneStats(
  shards: (StatShard | null)[],
  isAP: boolean
): ItemStats {
  const result: ItemStats = {};

  for (const shard of shards) {
    if (!shard) continue;

    const { stats } = shard;

    if (stats.adaptiveForce) {
      // Adaptive Force: +5.4 AD or +9 AP
      if (isAP) {
        result.ap = (result.ap || 0) + stats.adaptiveForce;
      } else {
        result.ad = (result.ad || 0) + stats.adaptiveForce * 0.6;
      }
    }
    if (stats.attackSpeed) {
      result.attackSpeed = (result.attackSpeed || 0) + stats.attackSpeed;
    }
    if (stats.abilityHaste) {
      result.abilityHaste = (result.abilityHaste || 0) + stats.abilityHaste;
    }
    if (stats.hp) {
      result.hp = (result.hp || 0) + stats.hp;
    }
    if (stats.armor) {
      result.armor = (result.armor || 0) + stats.armor;
    }
    if (stats.mr) {
      result.mr = (result.mr || 0) + stats.mr;
    }
    if (stats.moveSpeed) {
      result.moveSpeed = (result.moveSpeed || 0) + stats.moveSpeed;
    }
  }

  return result;
}
