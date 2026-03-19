import type { ChampionBaseStats, FinalStats, ItemStats } from "@lol-sim/types";
import { calcChampionStats, calcAttackSpeed } from "./championStats";

/**
 * Merge champion base stats (at level) with aggregated item stats.
 * This produces the final stat block used for all calculations.
 */
export function mergeStats(
  baseStats: ChampionBaseStats,
  level: number,
  itemStats: ItemStats
): FinalStats {
  const champ = calcChampionStats(baseStats, level);

  const bonusHp = itemStats.hp || 0;
  const bonusAd = itemStats.ad || 0;

  // Move speed: flat additive first, then percentage multiplier
  const flatMoveSpeed = champ.moveSpeed + (itemStats.moveSpeed || 0);
  const moveSpeedPercent = itemStats.moveSpeedPercent || 0;
  const finalMoveSpeed = flatMoveSpeed * (1 + moveSpeedPercent / 100);

  return {
    hp: champ.hp + bonusHp,
    baseHp: champ.baseHp,
    bonusHp,
    mp: champ.mp + (itemStats.mana || 0),
    ad: champ.ad + bonusAd,
    baseAd: champ.baseAd,
    bonusAd,
    ap: itemStats.ap || 0,
    armor: champ.armor + (itemStats.armor || 0),
    mr: champ.mr + (itemStats.mr || 0),
    attackSpeed: calcAttackSpeed(
      baseStats.attackSpeed,
      baseStats.attackSpeedRatio,
      baseStats.attackSpeedGrowth,
      level,
      itemStats.attackSpeed || 0
    ),
    critChance: Math.min(100, itemStats.critChance || 0),
    critDamage: champ.critDamage,
    lethality: itemStats.lethality || 0,
    armorPen: itemStats.armorPen || 0,
    magicPen: itemStats.magicPen || 0,
    magicPenPercent: itemStats.magicPenPercent || 0,
    abilityHaste: itemStats.abilityHaste || 0,
    lifeSteal: itemStats.lifeSteal || 0,
    omnivamp: itemStats.omnivamp || 0,
    moveSpeed: finalMoveSpeed,
    range: champ.range,
  };
}
