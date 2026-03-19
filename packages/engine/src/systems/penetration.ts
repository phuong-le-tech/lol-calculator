/**
 * Penetration is applied in strict order:
 * 1. Flat armor/MR reduction
 * 2. Percentage armor/MR reduction
 * 3. Percentage armor/MR penetration
 * 4. Flat armor penetration (lethality)
 */

/** Convert lethality to flat armor penetration based on attacker level */
export function lethalityToFlatPen(lethality: number, level: number): number {
  return lethality * (0.6 + (0.4 * level) / 18);
}

export interface PenetrationParams {
  baseResist: number;
  /** Flat reduction (e.g., Corki passive) — rare, usually 0 */
  flatReduction?: number;
  /** Percentage reduction (e.g., Black Cleaver stacks) — 0-100 */
  percentReduction?: number;
  /** Percentage penetration (e.g., Lord Dominik's, Void Staff) — 0-100 */
  percentPen?: number;
  /** Lethality (converted to flat pen by level) */
  lethality?: number;
  /** Flat magic pen (e.g., Shadowflame, Sorc Shoes) */
  flatMagicPen?: number;
  /** Attacker level (for lethality conversion) */
  attackerLevel?: number;
}

/**
 * Calculate effective resistance after all penetration/reduction.
 * The result can be negative (damage amplification).
 */
export function calcEffectiveResist(params: PenetrationParams): number {
  let resist = params.baseResist;

  // Step 1: Flat reduction
  resist -= params.flatReduction || 0;

  // Step 2: Percentage reduction
  if (params.percentReduction) {
    resist *= 1 - params.percentReduction / 100;
  }

  // Step 3: Percentage penetration (only applies to positive resist)
  if (resist > 0 && params.percentPen) {
    resist *= 1 - params.percentPen / 100;
  }

  // Step 4: Flat penetration (lethality for armor, flat pen for MR)
  if (params.lethality && params.attackerLevel != null) {
    resist -= lethalityToFlatPen(params.lethality, params.attackerLevel);
  }
  if (params.flatMagicPen) {
    resist -= params.flatMagicPen;
  }

  return resist;
}
