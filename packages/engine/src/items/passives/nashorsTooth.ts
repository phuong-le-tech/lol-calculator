import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/** Nashor's Tooth: On-hit magic damage equal to 15 + 20% AP */
const nashorsTooth: ItemPassiveDefinition = {
  itemId: 3115,
  name: "Icathian Bite",
  hook: "onAutoAttack",
  apply: (ctx) => {
    ctx.bonusMagicDamage += 15 + ctx.stats.ap * 0.2;
  },
};

registerPassive(nashorsTooth);

export default nashorsTooth;
