import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Kraken Slayer (reworked): 2-stack system.
 * Basic attacks grant 1 stack (max 2). At 2 stacks, next attack consumes
 * all stacks for bonus physical damage.
 *
 * Base damage: 150-200 (scales linearly level 1-18)
 * Missing HP scaling: up to +50% bonus based on target's missing HP
 * Ranged penalty: 80% effectiveness
 *
 * For DPS mode (autoAttackCount=0), we average: procs every 3rd hit.
 */
const krakenSlayer: ItemPassiveDefinition = {
  itemId: 6672,
  name: "Bring It Down",
  hook: "onAutoAttack",
  apply: (ctx) => {
    // Base damage scales 150-200 from level 1-18
    const level = ctx.attacker.level;
    const baseDamage = 150 + (200 - 150) * ((level - 1) / 17);

    // Missing HP scaling: up to +50% bonus damage at low HP
    const missingHP = ctx.target.hp - ctx.target.currentHP;
    const missingHPRatio = ctx.target.hp > 0 ? missingHP / ctx.target.hp : 0;
    const missingHPBonus = 1 + 0.5 * missingHPRatio;

    let fullDamage = baseDamage * missingHPBonus;

    // Ranged penalty: 80% effectiveness
    if (ctx.attacker.attackType === "RANGED") {
      fullDamage *= 0.8;
    }

    if (ctx.autoAttackCount > 0) {
      // Combo mode: procs every 3rd hit (2 stacks + proc hit)
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
