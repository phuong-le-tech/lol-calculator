/**
 * Penetration is applied in strict order:
 * 1. Flat armor/MR reduction  (CAN go below 0)
 * 2. Percentage armor/MR reduction
 * 3. Percentage armor/MR penetration  (cannot reduce below 0)
 * 4. Flat armor penetration / lethality / flat magic pen  (cannot reduce below 0)
 *
 * Since V14.1, lethality equals flat armor penetration 1:1 (no level scaling).
 */

/**
 * Lethality equals flat armor penetration directly (1:1).
 * Since V14.1, there is no level scaling.
 */
export function lethalityToFlatPen(lethality: number): number {
  return lethality;
}

export interface PenetrationParams {
  baseResist: number;
  /** Flat reduction (e.g., Corki passive) — rare, usually 0. CAN make resist negative. */
  flatReduction?: number;
  /** Percentage reduction (e.g., Black Cleaver stacks) — 0-100 */
  percentReduction?: number;
  /** Percentage penetration (e.g., Lord Dominik's, Void Staff) — 0-100 */
  percentPen?: number;
  /** Lethality (equals flat armor pen 1:1 since V14.1) */
  lethality?: number;
  /** Flat magic pen (e.g., Shadowflame, Sorc Shoes) */
  flatMagicPen?: number;
}

/**
 * Calculate effective resistance after all penetration/reduction.
 * Only flat reduction (step 1) can make resist go negative.
 * Penetration (steps 3-4) cannot reduce resist below 0.
 */
export function calcEffectiveResist(params: PenetrationParams): number {
  let resist = params.baseResist;

  // Step 1: Flat reduction (CAN go below 0)
  resist -= params.flatReduction || 0;

  // Step 2: Percentage reduction
  if (params.percentReduction) {
    resist *= 1 - params.percentReduction / 100;
  }

  // Step 3: Percentage penetration (only applies to positive resist, cannot reduce below 0)
  if (resist > 0 && params.percentPen) {
    resist *= 1 - params.percentPen / 100;
  }

  // Step 4: Flat penetration (lethality for armor, flat pen for MR)
  // Cannot reduce resist below 0
  if (resist > 0) {
    if (params.lethality) {
      resist = Math.max(0, resist - lethalityToFlatPen(params.lethality));
    }
    if (params.flatMagicPen) {
      resist = Math.max(0, resist - params.flatMagicPen);
    }
  }

  return resist;
}
