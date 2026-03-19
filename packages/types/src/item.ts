import type { CombatContext } from "./simulation";

export interface ItemStats {
  ad?: number;
  ap?: number;
  hp?: number;
  mana?: number;
  armor?: number;
  mr?: number;
  attackSpeed?: number;
  critChance?: number;
  lethality?: number;
  armorPen?: number;
  magicPen?: number;
  magicPenPercent?: number;
  abilityHaste?: number;
  lifeSteal?: number;
  omnivamp?: number;
  moveSpeed?: number;
  moveSpeedPercent?: number;
}

export type CombatHook =
  | "preCalculation"
  | "onAutoAttack"
  | "onAbilityCast"
  | "onDamageDealt"
  | "onCrit"
  | "postCalculation";

export interface ItemPassiveDefinition {
  itemId: number;
  name: string;
  hook: CombatHook;
  apply: (ctx: CombatContext) => void;
}

export interface Item {
  riotId: number;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  category: "damage" | "magic" | "defense" | "attack_speed" | "boots" | "other";
  stats: ItemStats;
  isCompleted: boolean;
  patchId: string;
}
