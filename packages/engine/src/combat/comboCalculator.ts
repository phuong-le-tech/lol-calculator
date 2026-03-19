import type {
  FinalStats,
  Ability,
  AbilityKey,
  ComboStep,
  AbilityResult,
  CombatContext,
  ItemStats,
} from "@lol-sim/types";
import { calcAutoAttackDamage } from "./damageCalculator";
import { calcAbilityDamage } from "./damageCalculator";
import { applyPassives } from "../items/passiveRegistry";

export interface ComboResult {
  sequence: ComboStep[];
  totalDamage: number;
  targetHP: number;
  isLethal: boolean;
  overkill: number;
  steps: ComboStepResult[];
}

export interface ComboStepResult {
  step: ComboStep;
  damage: number;
  remainingHP: number;
}

/** Estimate combo execution time in seconds */
const ABILITY_CAST_TIME = 0.25;

function estimateComboTime(combo: ComboStep[], attackSpeed: number): number {
  let time = 0;
  for (const step of combo) {
    if (step.type === "auto") {
      time += 1 / attackSpeed;
    } else {
      time += ABILITY_CAST_TIME;
    }
  }
  return time;
}

export interface ComboOptions {
  equippedItemIds?: number[];
  itemStats?: ItemStats;
  attackType?: "MELEE" | "RANGED";
}

/**
 * Create a CombatContext for passive application.
 */
function makeCombatContext(
  stats: FinalStats,
  level: number,
  target: { armor: number; mr: number; hp: number },
  currentHP: number,
  options: ComboOptions,
  autoAttackCount: number,
  abilityCastBeforeAuto: boolean
): CombatContext {
  return {
    stats: { ...stats },
    itemStats: options.itemStats || {},
    attacker: {
      level,
      range: stats.range,
      attackType: options.attackType || (stats.range > 300 ? "RANGED" : "MELEE"),
      abilityRanks: {},
    },
    target: {
      hp: target.hp,
      currentHP,
      armor: target.armor,
      mr: target.mr,
    },
    bonusDamage: 0,
    bonusMagicDamage: 0,
    damageMultiplier: 1,
    autoAttackCount,
    abilityCastBeforeAuto,
  };
}

/**
 * Simulate a user-defined combo sequence.
 * Iterates through each step, calculates damage, tracks remaining HP.
 * Applies item passives at appropriate hooks.
 */
export function simulateCombo(
  combo: ComboStep[],
  stats: FinalStats,
  level: number,
  abilities: Ability[],
  abilityRanks: Record<string, number>,
  target: { armor: number; mr: number; hp: number },
  bonusOnHitPhysical: number = 0,
  bonusOnHitMagic: number = 0,
  options: ComboOptions = {}
): ComboResult {
  const equippedItemIds = options.equippedItemIds || [];

  // Apply preCalculation passives once
  let effectiveStats = stats;
  let damageMultiplier = 1;
  if (equippedItemIds.length > 0) {
    const preCtx = makeCombatContext(stats, level, target, target.hp, options, 0, false);
    const applied = applyPassives("preCalculation", equippedItemIds, preCtx);
    effectiveStats = applied.stats;
    damageMultiplier = applied.damageMultiplier;
  }

  let remainingHP = target.hp;
  const steps: ComboStepResult[] = [];
  let totalDamage = 0;
  let autoAttackCount = 0;
  let lastStepWasAbility = false;

  for (const step of combo) {
    let damage = 0;

    if (step.type === "auto") {
      autoAttackCount++;

      // Apply onAutoAttack passives
      let onHitPhysical = bonusOnHitPhysical;
      let onHitMagic = bonusOnHitMagic;

      if (equippedItemIds.length > 0) {
        const ctx = makeCombatContext(
          effectiveStats, level, target, remainingHP, options,
          autoAttackCount, lastStepWasAbility
        );
        const applied = applyPassives("onAutoAttack", equippedItemIds, ctx);
        onHitPhysical += applied.bonusDamage;
        onHitMagic += applied.bonusMagicDamage;
      }

      const result = calcAutoAttackDamage(
        effectiveStats,
        level,
        { ...target, hp: remainingHP },
        onHitPhysical,
        onHitMagic
      );
      damage = result.final;
      lastStepWasAbility = false;
    } else if (step.type === "ability" && step.key) {
      const ability = abilities.find((a) => a.key === step.key);
      const rank = abilityRanks[step.key] || 0;
      if (ability && rank > 0) {
        const result = calcAbilityDamage(ability, rank, effectiveStats, level, {
          ...target,
          currentHP: remainingHP,
        });
        if (result) {
          damage = result.final;
        }
      }
      lastStepWasAbility = true;
    }

    damage *= damageMultiplier;
    totalDamage += damage;
    remainingHP = Math.max(0, remainingHP - damage);
    steps.push({ step, damage, remainingHP });
  }

  return {
    sequence: combo,
    totalDamage,
    targetHP: target.hp,
    isLethal: totalDamage >= target.hp,
    overkill: Math.max(0, totalDamage - target.hp),
    steps,
  };
}

/**
 * Calculate time-to-kill using auto attacks only.
 * Returns time in seconds.
 *
 * NOTE: This assumes constant DPS (damage per hit does not change as
 * target HP decreases). For items like BotRK whose damage scales with
 * current HP, the actual TTK will be longer than reported.
 */
export function calcTimeToKillAutoOnly(
  stats: FinalStats,
  level: number,
  target: { armor: number; mr: number; hp: number },
  bonusOnHitPhysical: number = 0,
  bonusOnHitMagic: number = 0
): number {
  const autoResult = calcAutoAttackDamage(
    stats,
    level,
    target,
    bonusOnHitPhysical,
    bonusOnHitMagic
  );

  if (autoResult.final <= 0) return Infinity;
  if (autoResult.dps <= 0) return Infinity;

  return target.hp / autoResult.dps;
}

/**
 * Calculate time-to-kill with abilities woven in.
 * Simplified model: assumes combo is used once at the start,
 * then auto attacks fill the remaining HP.
 *
 * NOTE: Assumes constant auto-attack DPS for the remaining HP portion.
 * See calcTimeToKillAutoOnly for limitations.
 */
export function calcTimeToKillWithAbilities(
  combo: ComboStep[],
  stats: FinalStats,
  level: number,
  abilities: Ability[],
  abilityRanks: Record<string, number>,
  target: { armor: number; mr: number; hp: number },
  bonusOnHitPhysical: number = 0,
  bonusOnHitMagic: number = 0,
  options: ComboOptions = {}
): number {
  const comboResult = simulateCombo(
    combo,
    stats,
    level,
    abilities,
    abilityRanks,
    target,
    bonusOnHitPhysical,
    bonusOnHitMagic,
    options
  );

  const comboTime = estimateComboTime(combo, stats.attackSpeed);

  if (comboResult.isLethal) {
    return comboTime;
  }

  // Combo didn't kill — add auto-attack time for remaining HP.
  // Use remaining HP as target for more accurate DPS (matters for BotRK % current HP).
  const remainingHP = target.hp - comboResult.totalDamage;
  const autoResult = calcAutoAttackDamage(
    stats,
    level,
    { ...target, hp: remainingHP },
    bonusOnHitPhysical,
    bonusOnHitMagic
  );

  if (autoResult.dps <= 0) return Infinity;

  return comboTime + remainingHP / autoResult.dps;
}
