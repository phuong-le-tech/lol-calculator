import type { ChampionBaseStats, FinalStats } from "@lol-sim/types";

/** Clamp champion level to valid range (1-18) */
export function clampLevel(level: number): number {
  return Math.min(18, Math.max(1, Math.round(level)));
}

/**
 * Riot's official stat growth formula (curved scaling, not linear).
 * https://leagueoflegends.fandom.com/wiki/Champion_statistic#Increasing_Statistics
 */
export function calcGrowthStat(
  base: number,
  growth: number,
  level: number
): number {
  const lv = clampLevel(level);
  if (lv <= 1) return base;
  return base + growth * (lv - 1) * (0.7025 + 0.0175 * (lv - 1));
}

/** Calculate champion stats at a given level (no items). Level is clamped to 1-18. */
export function calcChampionStats(
  baseStats: ChampionBaseStats,
  level: number
): FinalStats {
  const lv = clampLevel(level);
  const hp = calcGrowthStat(baseStats.hp, baseStats.hpGrowth, lv);
  const ad = calcGrowthStat(baseStats.ad, baseStats.adGrowth, lv);

  return {
    hp,
    baseHp: hp,
    bonusHp: 0,
    mp: calcGrowthStat(baseStats.mp, baseStats.mpGrowth, lv),
    ad,
    baseAd: ad,
    bonusAd: 0,
    ap: 0,
    armor: calcGrowthStat(baseStats.armor, baseStats.armorGrowth, lv),
    mr: calcGrowthStat(baseStats.mr, baseStats.mrGrowth, lv),
    attackSpeed: calcAttackSpeed(
      baseStats.attackSpeed,
      baseStats.attackSpeedRatio,
      baseStats.attackSpeedGrowth,
      lv,
      0
    ),
    critChance: 0,
    critDamage: 175, // base crit damage is 175%
    lethality: 0,
    armorPen: 0,
    magicPen: 0,
    magicPenPercent: 0,
    abilityHaste: 0,
    lifeSteal: 0,
    omnivamp: 0,
    moveSpeed: baseStats.moveSpeed,
    range: baseStats.range,
  };
}

/**
 * Attack speed formula.
 * AS = baseAS + asRatio * (growthBonus + bonusAS%) / 100
 * asRatio is usually equal to baseAS but differs for some champions.
 * Capped at 2.5 (floor 0.2)
 */
export function calcAttackSpeed(
  baseAS: number,
  asRatio: number,
  asGrowth: number,
  level: number,
  bonusASPercent: number
): number {
  const lv = clampLevel(level);
  const growthBonus =
    lv <= 1
      ? 0
      : asGrowth * (lv - 1) * (0.7025 + 0.0175 * (lv - 1));
  const totalBonusPercent = growthBonus + bonusASPercent;
  return Math.min(2.5, Math.max(0.2, baseAS + asRatio * totalBonusPercent / 100));
}
