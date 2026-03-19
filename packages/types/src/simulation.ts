import type { AbilityKey, DamageType } from "./champion";
import type { ItemStats } from "./item";

/** Computed stats after merging champion base + growth + items + passives */
export interface FinalStats {
  hp: number;
  baseHp: number;
  bonusHp: number;
  mp: number;
  ad: number;
  baseAd: number;
  bonusAd: number;
  ap: number;
  armor: number;
  mr: number;
  attackSpeed: number;
  critChance: number;
  critDamage: number;
  lethality: number;
  armorPen: number;
  magicPen: number;
  magicPenPercent: number;
  abilityHaste: number;
  lifeSteal: number;
  omnivamp: number;
  moveSpeed: number;
  range: number;
}

export interface CombatContext {
  stats: FinalStats;
  itemStats: ItemStats;
  attacker: {
    level: number;
    range: number;
    attackType: "MELEE" | "RANGED";
    abilityRanks: Record<string, number>;
  };
  target: {
    hp: number;
    currentHP: number;
    armor: number;
    mr: number;
  };
  /** Bonus damage to be added (used by item passives) */
  bonusDamage: number;
  /** Bonus magic damage from on-hit effects */
  bonusMagicDamage: number;
  /** Multiplier applied to all final damage (e.g. Giant Slayer). Defaults to 1.0 */
  damageMultiplier: number;
  /** Number of auto attacks performed so far in this combo */
  autoAttackCount: number;
  /** Whether an ability was cast before the current auto attack */
  abilityCastBeforeAuto: boolean;
}

export type ComboStepType = "ability" | "auto";

export interface ComboStep {
  type: ComboStepType;
  key?: AbilityKey;
}

export interface AbilityResult {
  raw: number;
  final: number;
  damageType: DamageType;
}

export interface SimulationResult {
  stats: FinalStats;
  autoAttack: {
    raw: number;
    final: number;
    dps: number;
    effectiveArmor: number;
  };
  abilities: Partial<Record<AbilityKey, AbilityResult>>;
  combo: {
    sequence: ComboStep[];
    totalDamage: number;
    targetHP: number;
    isLethal: boolean;
    overkill: number;
  };
  timeToKill: {
    autoOnly: number;
    withAbilities: number;
  };
}

export interface SimulationInput {
  championRiotId: string;
  level: number;
  itemRiotIds: number[];
  abilityRanks: Record<string, number>;
  target: {
    mode: "custom" | "champion";
    hp?: number;
    armor?: number;
    mr?: number;
    championRiotId?: string;
    level?: number;
  };
  combo: ComboStep[];
}

export class SimulationInputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SimulationInputValidationError";
  }
}

const VALID_ABILITY_KEYS = new Set(["Q", "W", "E", "R", "P"]);
const MAX_ITEMS = 6;
const MAX_COMBO_STEPS = 50;
const MIN_LEVEL = 1;
const MAX_LEVEL = 18;

/** Validate a SimulationInput at the API boundary. Throws on invalid data. */
export function validateSimulationInput(input: unknown): SimulationInput {
  if (typeof input !== "object" || input === null) {
    throw new SimulationInputValidationError("Input must be an object");
  }

  const obj = input as Record<string, unknown>;

  // championRiotId
  if (typeof obj.championRiotId !== "string" || obj.championRiotId.length === 0) {
    throw new SimulationInputValidationError("championRiotId must be a non-empty string");
  }

  // level
  if (typeof obj.level !== "number" || !Number.isInteger(obj.level)) {
    throw new SimulationInputValidationError("level must be an integer");
  }
  if (obj.level < MIN_LEVEL || obj.level > MAX_LEVEL) {
    throw new SimulationInputValidationError(`level must be between ${MIN_LEVEL} and ${MAX_LEVEL}`);
  }

  // itemRiotIds
  if (!Array.isArray(obj.itemRiotIds)) {
    throw new SimulationInputValidationError("itemRiotIds must be an array");
  }
  if (obj.itemRiotIds.length > MAX_ITEMS) {
    throw new SimulationInputValidationError(`itemRiotIds cannot exceed ${MAX_ITEMS} items`);
  }
  for (const id of obj.itemRiotIds) {
    if (typeof id !== "number" || !Number.isInteger(id) || id < 0) {
      throw new SimulationInputValidationError("Each itemRiotId must be a non-negative integer");
    }
  }

  // abilityRanks
  if (typeof obj.abilityRanks !== "object" || obj.abilityRanks === null) {
    throw new SimulationInputValidationError("abilityRanks must be an object");
  }
  const ranks = obj.abilityRanks as Record<string, unknown>;
  for (const [key, val] of Object.entries(ranks)) {
    if (!VALID_ABILITY_KEYS.has(key)) {
      throw new SimulationInputValidationError(`Invalid ability key: ${key}`);
    }
    if (typeof val !== "number" || !Number.isFinite(val) || val < 0 || val > 5) {
      throw new SimulationInputValidationError(`abilityRanks.${key} must be 0-5`);
    }
  }

  // target
  if (typeof obj.target !== "object" || obj.target === null) {
    throw new SimulationInputValidationError("target must be an object");
  }
  const target = obj.target as Record<string, unknown>;
  if (target.mode !== "custom" && target.mode !== "champion") {
    throw new SimulationInputValidationError("target.mode must be 'custom' or 'champion'");
  }
  if (target.mode === "custom") {
    for (const field of ["hp", "armor", "mr"] as const) {
      if (target[field] !== undefined) {
        if (typeof target[field] !== "number" || !Number.isFinite(target[field] as number) || (target[field] as number) < 0) {
          throw new SimulationInputValidationError(`target.${field} must be a non-negative number`);
        }
      }
    }
  }

  // combo
  if (!Array.isArray(obj.combo)) {
    throw new SimulationInputValidationError("combo must be an array");
  }
  if (obj.combo.length > MAX_COMBO_STEPS) {
    throw new SimulationInputValidationError(`combo cannot exceed ${MAX_COMBO_STEPS} steps`);
  }
  for (const step of obj.combo) {
    if (typeof step !== "object" || step === null) {
      throw new SimulationInputValidationError("Each combo step must be an object");
    }
    const s = step as Record<string, unknown>;
    if (s.type !== "ability" && s.type !== "auto") {
      throw new SimulationInputValidationError("combo step type must be 'ability' or 'auto'");
    }
    if (s.type === "ability" && (!s.key || !VALID_ABILITY_KEYS.has(s.key as string))) {
      throw new SimulationInputValidationError("ability combo step must have a valid key (Q/W/E/R/P)");
    }
    if (s.type === "auto" && s.key !== undefined) {
      throw new SimulationInputValidationError("auto combo step must not have a key");
    }
  }

  return obj as unknown as SimulationInput;
}
