import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/** Infinity Edge: If crit chance >= 60%, increase crit damage to 215% */
const infinityEdge: ItemPassiveDefinition = {
  itemId: 3031,
  name: "Perfection",
  hook: "preCalculation",
  apply: (ctx) => {
    if (ctx.stats.critChance >= 60) {
      ctx.stats.critDamage = 215;
    }
  },
};

registerPassive(infinityEdge);

export default infinityEdge;
