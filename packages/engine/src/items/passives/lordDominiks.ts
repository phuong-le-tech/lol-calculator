import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Lord Dominik's Regards:
 * - 35% armor penetration (applied via ItemStats.armorPen)
 * - Giant Slayer: deal 0%-15% bonus damage based on max HP difference
 *   (0% at equal HP, 15% at 2000+ HP difference)
 */
const lordDominiks: ItemPassiveDefinition = {
  itemId: 3036,
  name: "Giant Slayer",
  hook: "preCalculation",
  apply: (ctx) => {
    // Giant Slayer: bonus damage based on max HP difference between attacker and target
    const hpDiff = Math.max(0, ctx.target.hp - ctx.stats.hp);
    // Scales linearly from 0% at 0 diff to 15% at 2000+ diff
    const bonusDamagePercent = Math.min(15, (hpDiff / 2000) * 15);
    // Apply as a multiplier to all damage dealt (matches in-game behavior)
    ctx.damageMultiplier *= 1 + bonusDamagePercent / 100;
  },
};

registerPassive(lordDominiks);

export default lordDominiks;
