import { describe, it, expect } from "vitest";
import { calcEffectiveResist, lethalityToFlatPen } from "../src/systems/penetration";

describe("lethalityToFlatPen", () => {
  it("converts lethality at level 1", () => {
    // 18 lethality at level 1: 18 * (0.6 + 0.4 * 1 / 18)
    const pen = lethalityToFlatPen(18, 1);
    expect(pen).toBeCloseTo(18 * (0.6 + 0.4 / 18), 2);
  });

  it("converts lethality at level 18 (full value)", () => {
    // At level 18: lethality * (0.6 + 0.4) = lethality * 1.0
    const pen = lethalityToFlatPen(18, 18);
    expect(pen).toBeCloseTo(18, 2);
  });

  it("scales linearly with level", () => {
    const l1 = lethalityToFlatPen(10, 1);
    const l9 = lethalityToFlatPen(10, 9);
    const l18 = lethalityToFlatPen(10, 18);
    expect(l9).toBeGreaterThan(l1);
    expect(l18).toBeGreaterThan(l9);
  });
});

describe("calcEffectiveResist", () => {
  it("returns base resist with no penetration", () => {
    const result = calcEffectiveResist({ baseResist: 100 });
    expect(result).toBe(100);
  });

  it("applies flat reduction first", () => {
    const result = calcEffectiveResist({
      baseResist: 100,
      flatReduction: 20,
    });
    expect(result).toBe(80);
  });

  it("applies percentage reduction after flat reduction", () => {
    const result = calcEffectiveResist({
      baseResist: 100,
      flatReduction: 20,
      percentReduction: 25,
    });
    // 100 - 20 = 80, then 80 * 0.75 = 60
    expect(result).toBe(60);
  });

  it("applies percentage penetration after reductions", () => {
    const result = calcEffectiveResist({
      baseResist: 100,
      percentPen: 35,
    });
    // 100 * (1 - 0.35) = 65
    expect(result).toBe(65);
  });

  it("applies lethality as flat pen last", () => {
    const result = calcEffectiveResist({
      baseResist: 100,
      lethality: 18,
      attackerLevel: 18,
    });
    // 100 - 18 = 82 (full lethality at level 18)
    expect(result).toBeCloseTo(82, 0);
  });

  it("applies full penetration order correctly", () => {
    // 100 armor, 10 flat reduction, 30% reduction, 35% pen, 18 lethality at level 18
    const result = calcEffectiveResist({
      baseResist: 100,
      flatReduction: 10,
      percentReduction: 30,
      percentPen: 35,
      lethality: 18,
      attackerLevel: 18,
    });
    // Step 1: 100 - 10 = 90
    // Step 2: 90 * 0.70 = 63
    // Step 3: 63 * 0.65 = 40.95
    // Step 4: 40.95 - 18 = 22.95
    expect(result).toBeCloseTo(22.95, 1);
  });

  it("can go negative", () => {
    const result = calcEffectiveResist({
      baseResist: 20,
      lethality: 30,
      attackerLevel: 18,
    });
    expect(result).toBeLessThan(0);
  });

  it("does not apply % pen to negative resist", () => {
    // If resist is negative after reductions, % pen doesn't apply
    const result = calcEffectiveResist({
      baseResist: 5,
      flatReduction: 20,
      percentPen: 50,
    });
    // 5 - 20 = -15, negative so % pen skipped
    expect(result).toBe(-15);
  });

  it("applies flat magic pen", () => {
    const result = calcEffectiveResist({
      baseResist: 50,
      flatMagicPen: 18,
    });
    expect(result).toBe(32);
  });
});
