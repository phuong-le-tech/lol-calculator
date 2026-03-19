import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/** Rabadon's Deathcap: Increase AP by 35% */
const rabadonsDeathcap: ItemPassiveDefinition = {
  itemId: 3089,
  name: "Magical Opus",
  hook: "preCalculation",
  apply: (ctx) => {
    ctx.stats.ap = Math.floor(ctx.stats.ap * 1.35);
  },
};

registerPassive(rabadonsDeathcap);

export default rabadonsDeathcap;
