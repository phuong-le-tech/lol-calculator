import type { FinalStats, CombatContext } from "@lol-sim/types";

/** Helper to create a FinalStats with sensible defaults */
export function makeStats(overrides?: Partial<FinalStats>): FinalStats {
  return {
    hp: 2000,
    baseHp: 1600,
    bonusHp: 400,
    mp: 300,
    ad: 100,
    baseAd: 70,
    bonusAd: 30,
    ap: 0,
    armor: 80,
    mr: 40,
    attackSpeed: 1.0,
    critChance: 0,
    critDamage: 175,
    lethality: 0,
    armorPen: 0,
    magicPen: 0,
    magicPenPercent: 0,
    abilityHaste: 0,
    lifeSteal: 0,
    omnivamp: 0,
    moveSpeed: 340,
    range: 525,
    ...overrides,
  };
}

/** Helper to create a CombatContext with sensible defaults */
export function createCombatContext(overrides?: Partial<CombatContext>): CombatContext {
  const defaultStats = makeStats({ ap: 200, ...(overrides?.stats || {}) });

  return {
    stats: defaultStats,
    itemStats: overrides?.itemStats || {},
    attacker: overrides?.attacker || {
      level: 10,
      range: 525,
      attackType: "RANGED",
      abilityRanks: {},
    },
    target: overrides?.target || { hp: 2000, currentHP: 2000, armor: 100, mr: 50 },
    bonusDamage: overrides?.bonusDamage || 0,
    bonusMagicDamage: overrides?.bonusMagicDamage || 0,
    damageMultiplier: overrides?.damageMultiplier ?? 1,
    autoAttackCount: overrides?.autoAttackCount || 0,
    abilityCastBeforeAuto: overrides?.abilityCastBeforeAuto || false,
  };
}
