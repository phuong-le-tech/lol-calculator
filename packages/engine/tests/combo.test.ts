import { describe, it, expect } from "vitest";
import {
  simulateCombo,
  calcTimeToKillAutoOnly,
  calcTimeToKillWithAbilities,
} from "../src/combat/comboCalculator";
import type { Ability, ComboStep } from "@lol-sim/types";
import { makeStats } from "./helpers";

// combo tests use different defaults (higher ad, attackSpeed)
function makeComboStats(overrides?: Parameters<typeof makeStats>[0]) {
  return makeStats({ ad: 200, baseAd: 100, bonusAd: 100, attackSpeed: 1.5, ...overrides });
}

const stats = makeComboStats();
const target = { armor: 100, mr: 50, hp: 1500 };

const testAbility: Ability = {
  key: "Q",
  name: "Test Q",
  description: "",
  imageUrl: "",
  maxRank: 5,
  baseDamage: [100, 150, 200, 250, 300],
  damageType: "physical",
  scalings: [{ type: "ad", values: [0.8, 0.9, 1.0, 1.1, 1.2] }],
  cooldown: [8, 7, 6, 5, 4],
  cost: [50, 55, 60, 65, 70],
};

describe("simulateCombo", () => {
  it("calculates damage for auto-only combo", () => {
    const combo: ComboStep[] = [
      { type: "auto" },
      { type: "auto" },
      { type: "auto" },
    ];
    const result = simulateCombo(combo, stats, 10, [], {}, target);

    expect(result.steps).toHaveLength(3);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.steps[0].damage).toBeCloseTo(100, 0);
  });

  it("calculates damage for ability + auto combo", () => {
    const combo: ComboStep[] = [
      { type: "ability", key: "Q" },
      { type: "auto" },
      { type: "auto" },
    ];
    const result = simulateCombo(
      combo,
      stats,
      10,
      [testAbility],
      { Q: 3 },
      target
    );

    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].damage).toBeCloseTo(200, 0);
  });

  it("tracks remaining HP correctly", () => {
    const combo: ComboStep[] = [{ type: "auto" }, { type: "auto" }];
    const result = simulateCombo(combo, stats, 10, [], {}, target);

    expect(result.steps[0].remainingHP).toBeCloseTo(1400, 0);
    expect(result.steps[1].remainingHP).toBeCloseTo(1300, 0);
  });

  it("detects lethal combo", () => {
    const highStats = makeComboStats({ ad: 500, baseAd: 100, bonusAd: 400 });
    const combo: ComboStep[] = Array(7).fill({ type: "auto" });
    const result = simulateCombo(combo, highStats, 18, [], {}, target);
    expect(result.isLethal).toBe(true);
    expect(result.overkill).toBeGreaterThan(0);
  });

  it("handles empty combo", () => {
    const result = simulateCombo([], stats, 10, [], {}, target);
    expect(result.totalDamage).toBe(0);
    expect(result.isLethal).toBe(false);
  });
});

describe("calcTimeToKillAutoOnly", () => {
  it("calculates TTK correctly", () => {
    const ttk = calcTimeToKillAutoOnly(stats, 10, target);
    expect(ttk).toBeCloseTo(10, 0);
  });

  it("returns Infinity for 0 damage", () => {
    const zeroStats = makeComboStats({ ad: 0, baseAd: 0, bonusAd: 0 });
    const ttk = calcTimeToKillAutoOnly(zeroStats, 10, target);
    expect(ttk).toBe(Infinity);
  });
});

describe("calcTimeToKillWithAbilities", () => {
  it("returns combo time when combo is lethal", () => {
    const highStats = makeComboStats({ ad: 800, baseAd: 100, bonusAd: 700 });
    const combo: ComboStep[] = [
      { type: "ability", key: "Q" },
      { type: "auto" },
      { type: "auto" },
      { type: "auto" },
    ];
    const lowTarget = { armor: 50, mr: 30, hp: 500 };
    const ttk = calcTimeToKillWithAbilities(
      combo,
      highStats,
      18,
      [testAbility],
      { Q: 5 },
      lowTarget
    );
    // Should be: 0.25s (ability) + 3 * (1/1.5)s (autos) = 0.25 + 2.0 = 2.25s
    // But combo is lethal well before all steps, so TTK = combo execution time
    expect(ttk).toBeGreaterThan(0);
    expect(ttk).toBeLessThan(5);
  });

  it("adds auto time when combo is not lethal", () => {
    const combo: ComboStep[] = [{ type: "ability", key: "Q" }];
    const ttk = calcTimeToKillWithAbilities(
      combo,
      stats,
      10,
      [testAbility],
      { Q: 1 },
      target
    );
    // Combo does some damage, then autos fill the rest
    expect(ttk).toBeGreaterThan(0);
    expect(ttk).toBeLessThan(Infinity);
  });

  it("returns Infinity when no damage possible", () => {
    const zeroStats = makeComboStats({ ad: 0, baseAd: 0, bonusAd: 0, ap: 0 });
    const ttk = calcTimeToKillWithAbilities([], zeroStats, 10, [], {}, target);
    expect(ttk).toBe(Infinity);
  });
});
