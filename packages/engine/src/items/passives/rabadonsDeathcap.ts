import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/** Rabadon's Deathcap: Increase total AP by 30% (reduced from 35% in V14.19) */
const rabadonsDeathcap: ItemPassiveDefinition = {
  itemId: 3089,
  name: "Magical Opus",
  hook: "preCalculation",
  apply: (ctx) => {
    ctx.stats.ap = Math.floor(ctx.stats.ap * 1.30);
  },
};

registerPassive(rabadonsDeathcap);

export default rabadonsDeathcap;
