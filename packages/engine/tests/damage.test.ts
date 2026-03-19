import { describe, it, expect } from "vitest";
import {
  calcDamageAfterResist,
  calcCritMultiplier,
  calcAutoAttackDamage,
  calcAbilityDamage,
} from "../src/combat/damageCalculator";
import type { Ability } from "@lol-sim/types";
import { makeStats } from "./helpers";

describe("calcDamageAfterResist", () => {
  it("reduces damage with positive resist", () => {
    expect(calcDamageAfterResist(200, 100)).toBeCloseTo(100, 0);
  });

  it("returns full damage at 0 resist", () => {
    expect(calcDamageAfterResist(200, 0)).toBe(200);
  });

  it("amplifies damage with negative resist", () => {
    const result = calcDamageAfterResist(200, -50);
    expect(result).toBeGreaterThan(200);
    expect(result).toBeCloseTo(266.67, 0);
  });

  it("handles high resist correctly", () => {
    expect(calcDamageAfterResist(400, 300)).toBeCloseTo(100, 0);
  });
});

describe("calcCritMultiplier", () => {
  it("returns 1.0 with 0% crit", () => {
    expect(calcCritMultiplier(0, 175)).toBe(1);
  });

  it("returns correct average at 25% crit, 175% crit damage", () => {
    expect(calcCritMultiplier(25, 175)).toBeCloseTo(1.1875, 4);
  });

  it("returns 1.75 at 100% crit, 175% crit damage", () => {
    expect(calcCritMultiplier(100, 175)).toBeCloseTo(1.75, 4);
  });

  it("returns 2.15 at 100% crit with IE (215%)", () => {
    expect(calcCritMultiplier(100, 215)).toBeCloseTo(2.15, 4);
  });

  it("clamps crit chance to 0-100", () => {
    expect(calcCritMultiplier(-10, 175)).toBe(1);
    expect(calcCritMultiplier(150, 175)).toBeCloseTo(1.75, 4);
  });
});

describe("calcAutoAttackDamage", () => {
  const baseStats = makeStats();
  const target = { armor: 100, mr: 50, hp: 2000 };

  it("calculates basic auto attack damage", () => {
    const result = calcAutoAttackDamage(baseStats, 10, target);
    expect(result.raw).toBe(100);
    expect(result.final).toBeCloseTo(50, 0);
    expect(result.dps).toBeCloseTo(50, 0);
  });

  it("includes crit multiplier in raw damage", () => {
    const statsWithCrit = makeStats({ critChance: 100, critDamage: 175 });
    const result = calcAutoAttackDamage(statsWithCrit, 10, target);
    expect(result.raw).toBeCloseTo(175, 0);
  });

  it("includes on-hit magic damage", () => {
    const result = calcAutoAttackDamage(baseStats, 10, target, 0, 50);
    expect(result.final).toBeCloseTo(83.33, 0);
  });
});

describe("calcAbilityDamage", () => {
  const stats = makeStats({ ap: 200 });
  const target = { armor: 50, mr: 80, hp: 2000 };

  const magicAbility: Ability = {
    key: "Q",
    name: "Test Ability",
    description: "A test ability",
    imageUrl: "",
    maxRank: 5,
    baseDamage: [80, 120, 160, 200, 240],
    damageType: "magic",
    scalings: [{ type: "ap", values: [0.6, 0.65, 0.7, 0.75, 0.8] }],
    cooldown: [8, 7, 6, 5, 4],
    cost: [60, 65, 70, 75, 80],
  };

  it("returns null for rank 0", () => {
    expect(calcAbilityDamage(magicAbility, 0, stats, 10, target)).toBeNull();
  });

  it("returns null for rank exceeding baseDamage array length", () => {
    const shortAbility: Ability = {
      ...magicAbility,
      maxRank: 5,
      baseDamage: [80, 120], // only 2 entries but maxRank is 5
    };
    expect(calcAbilityDamage(shortAbility, 3, stats, 10, target)).toBeNull();
  });

  it("calculates magic damage with AP scaling", () => {
    const result = calcAbilityDamage(magicAbility, 3, stats, 10, target);
    expect(result).not.toBeNull();
    expect(result!.raw).toBeCloseTo(300, 0);
    expect(result!.damageType).toBe("magic");
    expect(result!.final).toBeCloseTo(166.67, 0);
  });

  it("handles true damage (ignores resist)", () => {
    const trueDmgAbility: Ability = { ...magicAbility, damageType: "true" };
    const result = calcAbilityDamage(trueDmgAbility, 1, stats, 10, target);
    expect(result!.raw).toBeCloseTo(200, 0);
    expect(result!.final).toBeCloseTo(200, 0);
  });

  it("handles physical damage abilities", () => {
    const physAbility: Ability = {
      ...magicAbility,
      damageType: "physical",
      scalings: [{ type: "ad", values: [1.0, 1.1, 1.2, 1.3, 1.4] }],
    };
    const result = calcAbilityDamage(physAbility, 1, stats, 10, target);
    expect(result!.raw).toBeCloseTo(180, 0);
    expect(result!.final).toBeCloseTo(120, 0);
  });

  it("uses bonusAd for bonus AD scaling (not total AD)", () => {
    const bonusAdAbility: Ability = {
      ...magicAbility,
      damageType: "physical",
      scalings: [{ type: "bonusAd", values: [1.0, 1.0, 1.0, 1.0, 1.0] }],
    };
    const result = calcAbilityDamage(bonusAdAbility, 1, stats, 10, target);
    // base 80 + 1.0 * bonusAd(30) = 110 raw
    expect(result!.raw).toBeCloseTo(110, 0);
  });

  it("uses bonusHp for bonus HP scaling (not total HP)", () => {
    const bonusHpAbility: Ability = {
      ...magicAbility,
      damageType: "magic",
      baseDamage: [0, 0, 0, 0, 0],
      scalings: [{ type: "bonusHp", values: [0.1, 0.1, 0.1, 0.1, 0.1] }],
    };
    const result = calcAbilityDamage(bonusHpAbility, 1, stats, 10, target);
    // 0 + 0.1 * bonusHp(400) = 40 raw
    expect(result!.raw).toBeCloseTo(40, 0);
  });
});
