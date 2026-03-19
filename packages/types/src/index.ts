export type {
  Champion,
  ChampionBaseStats,
  AttackType,
  Ability,
  AbilityKey,
  AbilityScaling,
  DamageType,
  ScalingType,
} from "./champion";

export type {
  Item,
  ItemStats,
  ItemPassiveDefinition,
  CombatHook,
} from "./item";

export type { Target } from "./target";

export type {
  FinalStats,
  CombatContext,
  ComboStep,
  ComboStepType,
  AbilityResult,
  SimulationResult,
  SimulationInput,
} from "./simulation";

export {
  validateSimulationInput,
  SimulationInputValidationError,
} from "./simulation";

export type { SavedBuild } from "./build";
export { sanitizeNotes } from "./build";
