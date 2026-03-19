import type { ItemPassiveDefinition } from "@lol-sim/types";
import { registerPassive } from "../passiveRegistry";

/**
 * Lord Dominik's Regards:
 * - 35% armor penetration (applied via ItemStats.armorPen, not as a passive)
 * - Giant Slayer passive was REMOVED in V14.10
 *
 * The 35% armor pen is a stat, not an active passive effect.
 * This passive definition is kept as a no-op for registry completeness,
 * since the armor pen is handled via the item's stats.
 */
const lordDominiks: ItemPassiveDefinition = {
  itemId: 3036,
  name: "Last Whisper",
  hook: "preCalculation",
  apply: () => {
    // 35% armor pen is applied as a stat (armorPen) on the item itself.
    // Giant Slayer passive was removed in V14.10.
    // No active passive effect.
  },
};

registerPassive(lordDominiks);

export default lordDominiks;
