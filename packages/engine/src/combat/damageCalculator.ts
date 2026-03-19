import type {
  FinalStats,
  DamageType,
  Ability,
  AbilityResult,
  AbilityKey,
} from "@lol-sim/types";
import { calcEffectiveResist, lethalityToFlatPen } from "../systems/penetration";

/**
 * Damage after resistance formula.
 * Positive resist → damage reduction.
 * Negative resist → damage amplification.
 */
export function calcDamageAfterResist(
  rawDamage: number,
  effectiveResist: number
): number {
  if (effectiveResist >= 0) {
    return rawDamage * (100 / (100 + effectiveResist));
  }
  // Negative resist = damage amplification
  return rawDamage * (2 - 100 / (100 - effectiveResist));
}

/**
 * Critical strike average multiplier.
 * Returns the average damage multiplier accounting for crit chance + crit damage.
 */
export function calcCritMultiplier(
  critChance: number,
  critDamage: number
): number {
  const clampedCrit = Math.min(100, Math.max(0, critChance));
  return 1 + (clampedCrit / 100) * ((critDamage - 100) / 100);
}

export interface AutoAttackResult {
  raw: number;
  final: number;
  dps: number;
  effectiveArmor: number;
}

/** Calculate auto-attack damage against a target */
export function calcAutoAttackDamage(
  stats: FinalStats,
  level: number,
  target: { armor: number; mr: number; hp: number },
  bonusOnHitPhysical: number = 0,
  bonusOnHitMagic: number = 0
): AutoAttackResult {
  const critMultiplier = calcCritMultiplier(stats.critChance, stats.critDamage);
  const rawPhysical = stats.ad * critMultiplier + bonusOnHitPhysical;

  const effectiveArmor = calcEffectiveResist({
    baseResist: target.armor,
    percentPen: stats.armorPen,
    lethality: stats.lethality,
    attackerLevel: level,
  });

  let finalDamage = calcDamageAfterResist(rawPhysical, effectiveArmor);

  // Add on-hit magic damage (reduced by target MR)
  if (bonusOnHitMagic > 0) {
    const effectiveMR = calcEffectiveResist({
      baseResist: target.mr,
      percentPen: stats.magicPenPercent,
      flatMagicPen: stats.magicPen,
    });
    finalDamage += calcDamageAfterResist(bonusOnHitMagic, effectiveMR);
  }

  const dps = finalDamage * stats.attackSpeed;

  return {
    raw: rawPhysical + bonusOnHitMagic,
    final: finalDamage,
    dps,
    effectiveArmor,
  };
}

/** Calculate ability damage against a target */
export function calcAbilityDamage(
  ability: Ability,
  rank: number,
  stats: FinalStats,
  level: number,
  target: { armor: number; mr: number; hp: number; currentHP?: number }
): AbilityResult | null {
  if (rank <= 0 || rank > ability.maxRank) return null;

  const rankIndex = rank - 1;

  // Guard against mismatched baseDamage array length
  if (rankIndex >= ability.baseDamage.length) return null;

  let rawDamage = ability.baseDamage[rankIndex] || 0;

  // Apply scalings
  for (const scaling of ability.scalings) {
    const coefficient = scaling.values[rankIndex] ?? scaling.values[scaling.values.length - 1] ?? 0;
    rawDamage += coefficient * getScalingStat(scaling.type, stats, target);
  }

  // Apply resistance
  let effectiveResist: number;
  if (ability.damageType === "physical") {
    effectiveResist = calcEffectiveResist({
      baseResist: target.armor,
      percentPen: stats.armorPen,
      lethality: stats.lethality,
      attackerLevel: level,
    });
  } else if (ability.damageType === "magic") {
    effectiveResist = calcEffectiveResist({
      baseResist: target.mr,
      percentPen: stats.magicPenPercent,
      flatMagicPen: stats.magicPen,
    });
  } else {
    // True damage ignores resist
    effectiveResist = 0;
  }

  const finalDamage =
    ability.damageType === "true"
      ? rawDamage
      : calcDamageAfterResist(rawDamage, effectiveResist);

  return {
    raw: rawDamage,
    final: finalDamage,
    damageType: ability.damageType,
  };
}

function getScalingStat(
  type: string,
  stats: FinalStats,
  target: { hp: number; currentHP?: number }
): number {
  switch (type) {
    case "ad":
      return stats.ad;
    case "bonusAd":
      return stats.bonusAd;
    case "ap":
      return stats.ap;
    case "bonusHp":
      return stats.bonusHp;
    case "maxHp":
      return stats.hp;
    case "armor":
      return stats.armor;
    case "mr":
      return stats.mr;
    case "targetMaxHp":
      return target.hp;
    case "targetCurrentHp":
      return target.currentHP ?? target.hp;
    case "targetMissingHp":
      return target.hp - (target.currentHP ?? target.hp);
    default:
      return 0;
  }
}
