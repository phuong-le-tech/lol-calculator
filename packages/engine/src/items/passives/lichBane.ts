import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Lich Bane: After using an ability, next auto deals
 * 75% base AD + 50% AP bonus magic damage.
 * Only applies when an ability was cast before the current auto.
 */
const lichBane: ItemPassiveDefinition = {
  itemId: 3100,
  name: "Spellblade",
  hook: "onAutoAttack",
  apply: (ctx) => {
    if (ctx.abilityCastBeforeAuto) {
      ctx.bonusMagicDamage += ctx.stats.baseAd * 0.75 + ctx.stats.ap * 0.5;
    }
  },
};

registerPassive(lichBane);

export default lichBane;
