import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Lich Bane: After using an ability, next auto deals
 * 75% base AD + 40% AP bonus magic damage (AP ratio reduced from 50% in V25.10).
 * Only applies when an ability was cast before the current auto.
 * Cooldown: 1.5s (not modeled in calculator).
 */
const lichBane: ItemPassiveDefinition = {
  itemId: 3100,
  name: "Spellblade",
  hook: "onAutoAttack",
  apply: (ctx) => {
    if (ctx.abilityCastBeforeAuto) {
      ctx.bonusMagicDamage += ctx.stats.baseAd * 0.75 + ctx.stats.ap * 0.4;
    }
  },
};

registerPassive(lichBane);

export default lichBane;
