import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Kraken Slayer: Every 3rd auto deals bonus true damage (35 + 60% bonus AD).
 * Uses autoAttackCount to determine if this is a 3rd-hit proc.
 * Falls back to averaging (/3) when autoAttackCount is 0 (DPS mode).
 */
const krakenSlayer: ItemPassiveDefinition = {
  itemId: 6672,
  name: "Bring It Down",
  hook: "onAutoAttack",
  apply: (ctx) => {
    const fullDamage = 35 + ctx.stats.bonusAd * 0.6;

    if (ctx.autoAttackCount > 0) {
      // Combo mode: only proc on every 3rd hit
      if (ctx.autoAttackCount % 3 === 0) {
        ctx.bonusDamage += fullDamage;
      }
    } else {
      // DPS mode: average over 3 hits
      ctx.bonusDamage += fullDamage / 3;
    }
  },
};

registerPassive(krakenSlayer);

export default krakenSlayer;
