import { describe, it, expect } from "vitest";
import { calcEffectiveResist, lethalityToFlatPen } from "../src/systems/penetration";

describe("lethalityToFlatPen", () => {
  it("converts lethality 1:1 (no level scaling since V14.1)", () => {
    expect(lethalityToFlatPen(18)).toBe(18);
  });

  it("converts any lethality value 1:1", () => {
    expect(lethalityToFlatPen(10)).toBe(10);
    expect(lethalityToFlatPen(0)).toBe(0);
    expect(lethalityToFlatPen(30)).toBe(30);
  });
});

describe("calcEffectiveResist", () => {
  it("returns base resist with no penetration", () => {
    const result = calcEffectiveResist({ baseResist: 100 });
    expect(result).toBe(100);
  });

  it("applies flat reduction first (CAN go below 0)", () => {
    const result = calcEffectiveResist({
      baseResist: 100,
      flatReduction: 20,
    });
    expect(result).toBe(80);
  });

  it("flat reduction CAN make resist negative", () => {
    const result = calcEffectiveResist({
      baseResist: 10,
      flatReduction: 30,
    });
    expect(result).toBe(-20);
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
    });
    // 100 - 18 = 82
    expect(result).toBeCloseTo(82, 0);
  });

  it("applies full penetration order correctly", () => {
    // 100 armor, 10 flat reduction, 30% reduction, 35% pen, 18 lethality
    const result = calcEffectiveResist({
      baseResist: 100,
      flatReduction: 10,
      percentReduction: 30,
      percentPen: 35,
      lethality: 18,
    });
    // Step 1: 100 - 10 = 90
    // Step 2: 90 * 0.70 = 63
    // Step 3: 63 * 0.65 = 40.95
    // Step 4: 40.95 - 18 = 22.95
    expect(result).toBeCloseTo(22.95, 1);
  });

  it("lethality cannot reduce resist below 0", () => {
    const result = calcEffectiveResist({
      baseResist: 20,
      lethality: 30,
    });
    // Lethality can't go below 0 (only flat reduction can)
    expect(result).toBe(0);
  });

  it("flat magic pen cannot reduce resist below 0", () => {
    const result = calcEffectiveResist({
      baseResist: 10,
      flatMagicPen: 25,
    });
    expect(result).toBe(0);
  });

  it("does not apply % pen to negative resist", () => {
    // If resist is negative after reductions, % pen doesn't apply
    const result = calcEffectiveResist({
      baseResist: 5,
      flatReduction: 20,
      percentPen: 50,
    });
    // 5 - 20 = -15, negative so % pen skipped, flat pen skipped
    expect(result).toBe(-15);
  });

  it("applies flat magic pen correctly", () => {
    const result = calcEffectiveResist({
      baseResist: 50,
      flatMagicPen: 18,
    });
    expect(result).toBe(32);
  });

  it("does not apply flat pen when resist is already 0 or below", () => {
    const result = calcEffectiveResist({
      baseResist: 5,
      flatReduction: 10,
      lethality: 20,
    });
    // 5 - 10 = -5, negative so lethality is not applied
    expect(result).toBe(-5);
  });
});
