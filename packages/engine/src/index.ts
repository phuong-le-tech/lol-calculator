// Stats
export { calcGrowthStat, calcChampionStats, calcAttackSpeed, clampLevel } from "./stats/championStats";
export { aggregateItemStats } from "./stats/itemStats";
export { mergeStats, applyMoveSpeedSoftCap } from "./stats/mergeStats";

// Combat
export {
  calcDamageAfterResist,
  calcCritMultiplier,
  calcAutoAttackDamage,
  calcAbilityDamage,
} from "./combat/damageCalculator";
export type { AutoAttackResult } from "./combat/damageCalculator";

export {
  simulateCombo,
  calcTimeToKillAutoOnly,
  calcTimeToKillWithAbilities,
} from "./combat/comboCalculator";
export type { ComboResult, ComboStepResult } from "./combat/comboCalculator";

// Systems
export { lethalityToFlatPen, calcEffectiveResist } from "./systems/penetration";
export type { PenetrationParams } from "./systems/penetration";
export { abilityHasteToCDR, calcEffectiveCooldown } from "./systems/abilityHaste";

// Item passives
export { PassiveRegistry, defaultRegistry, registerPassive, getPassive, getAllPassives, applyPassives } from "./items/passiveRegistry";

// Register all built-in passives
import "./items/passives";
