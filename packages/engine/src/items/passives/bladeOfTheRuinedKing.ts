import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Blade of the Ruined King: On-hit deals % of target's current HP.
 * Melee: 12%, Ranged: 8%
 */
const bladeOfTheRuinedKing: ItemPassiveDefinition = {
  itemId: 3153,
  name: "Mist's Edge",
  hook: "onAutoAttack",
  apply: (ctx) => {
    const percent = ctx.attacker.attackType === "RANGED" ? 0.08 : 0.12;
    ctx.bonusDamage += ctx.target.currentHP * percent;
  },
};

registerPassive(bladeOfTheRuinedKing);

export default bladeOfTheRuinedKing;
