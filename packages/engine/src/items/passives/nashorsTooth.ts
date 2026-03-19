import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/** Nashor's Tooth: On-hit magic damage equal to 15 + 15% AP (reduced from 20% in V14.19) */
const nashorsTooth: ItemPassiveDefinition = {
  itemId: 3115,
  name: "Icathian Bite",
  hook: "onAutoAttack",
  apply: (ctx) => {
    ctx.bonusMagicDamage += 15 + ctx.stats.ap * 0.15;
  },
};

registerPassive(nashorsTooth);

export default nashorsTooth;
