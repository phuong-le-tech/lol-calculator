import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Blade of the Ruined King: On-hit physical damage based on target's current HP.
 * Melee: 8%, Ranged: 5% (updated V14.1+)
 */
const bladeOfTheRuinedKing: ItemPassiveDefinition = {
  itemId: 3153,
  name: "Mist's Edge",
  hook: "onAutoAttack",
  apply: (ctx) => {
    const percent = ctx.attacker.attackType === "RANGED" ? 0.05 : 0.08;
    ctx.bonusDamage += ctx.target.currentHP * percent;
  },
};

registerPassive(bladeOfTheRuinedKing);

export default bladeOfTheRuinedKing;
