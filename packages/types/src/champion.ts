/** Base stats for a champion at level 1 */
export interface ChampionBaseStats {
  hp: number;
  hpGrowth: number;
  mp: number;
  mpGrowth: number;
  ad: number;
  adGrowth: number;
  armor: number;
  armorGrowth: number;
  mr: number;
  mrGrowth: number;
  attackSpeed: number;
  attackSpeedRatio: number;
  attackSpeedGrowth: number;
  moveSpeed: number;
  range: number;
}

export type AttackType = "MELEE" | "RANGED";

export interface Champion {
  riotId: string;
  name: string;
  title: string;
  role: string;
  attackType: AttackType;
  imageUrl: string;
  patchId: string;
  baseStats: ChampionBaseStats;
  abilities: Ability[];
}

export type AbilityKey = "Q" | "W" | "E" | "R" | "P";

export type DamageType = "physical" | "magic" | "true";

export type ScalingType =
  | "ad"
  | "bonusAd"
  | "ap"
  | "bonusHp"
  | "maxHp"
  | "armor"
  | "mr"
  | "targetMaxHp"
  | "targetCurrentHp"
  | "targetMissingHp";

export interface AbilityScaling {
  type: ScalingType;
  /** Coefficient per rank, e.g. [0.6, 0.7, 0.8, 0.9, 1.0] */
  values: number[];
}

export interface Ability {
  key: AbilityKey;
  name: string;
  description: string;
  imageUrl: string;
  maxRank: number;
  /** Base damage per rank */
  baseDamage: number[];
  damageType: DamageType;
  scalings: AbilityScaling[];
  /** Cooldown in seconds per rank */
  cooldown: number[];
  /** Mana/energy cost per rank */
  cost: number[];
}
