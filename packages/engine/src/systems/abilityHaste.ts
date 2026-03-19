/**
 * Ability Haste → Cooldown Reduction conversion.
 * CDR% = 1 - (1 / (1 + AH/100))
 * Effective cooldown = baseCooldown / (1 + AH/100)
 *
 * Ability haste is floored at 0 to prevent division by zero.
 */
export function abilityHasteToCDR(abilityHaste: number): number {
  const ah = Math.max(0, abilityHaste);
  return 1 - 1 / (1 + ah / 100);
}

export function calcEffectiveCooldown(
  baseCooldown: number,
  abilityHaste: number
): number {
  const ah = Math.max(0, abilityHaste);
  return baseCooldown / (1 + ah / 100);
}
