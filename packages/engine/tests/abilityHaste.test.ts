import { describe, it, expect } from "vitest";
import { abilityHasteToCDR, calcEffectiveCooldown } from "../src/systems/abilityHaste";

describe("abilityHasteToCDR", () => {
  it("returns 0% CDR at 0 ability haste", () => {
    expect(abilityHasteToCDR(0)).toBe(0);
  });

  it("returns ~33% CDR at 50 ability haste", () => {
    expect(abilityHasteToCDR(50)).toBeCloseTo(0.3333, 3);
  });

  it("returns 50% CDR at 100 ability haste", () => {
    expect(abilityHasteToCDR(100)).toBeCloseTo(0.5, 3);
  });

  it("handles large values without exceeding 100%", () => {
    const cdr = abilityHasteToCDR(500);
    expect(cdr).toBeLessThan(1);
    expect(cdr).toBeGreaterThan(0.8);
  });
});

describe("calcEffectiveCooldown", () => {
  it("returns base cooldown at 0 ability haste", () => {
    expect(calcEffectiveCooldown(10, 0)).toBe(10);
  });

  it("reduces cooldown with ability haste", () => {
    // 10s / (1 + 100/100) = 10/2 = 5s
    expect(calcEffectiveCooldown(10, 100)).toBeCloseTo(5, 2);
  });

  it("reduces cooldown proportionally", () => {
    // 8s / (1 + 50/100) = 8/1.5 ≈ 5.33s
    expect(calcEffectiveCooldown(8, 50)).toBeCloseTo(5.333, 2);
  });
});
