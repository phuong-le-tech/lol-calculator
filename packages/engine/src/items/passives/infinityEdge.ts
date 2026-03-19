import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Infinity Edge: Unconditionally increases crit damage by 40%.
 * Base crit = 175%, with IE = 215%.
 * Since V14.11, the 60% crit threshold was removed.
 */
const infinityEdge: ItemPassiveDefinition = {
  itemId: 3031,
  name: "Perfection",
  hook: "preCalculation",
  apply: (ctx) => {
    ctx.stats.critDamage += 40;
  },
};

registerPassive(infinityEdge);

export default infinityEdge;
