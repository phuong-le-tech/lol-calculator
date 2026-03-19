import { describe, it, expect } from "vitest";
import { calcGrowthStat, calcChampionStats, calcAttackSpeed } from "../src/stats/championStats";
import { aggregateItemStats } from "../src/stats/itemStats";
import { mergeStats } from "../src/stats/mergeStats";
import type { ChampionBaseStats, ItemStats } from "@lol-sim/types";

describe("calcGrowthStat", () => {
  it("returns base stat at level 1", () => {
    expect(calcGrowthStat(610, 101, 1)).toBe(610);
  });

  it("calculates Jinx HP at level 18 correctly", () => {
    // At level 18: 610 + 101 * 17 * (0.7025 + 0.0175 * 17) = 610 + 1717 = 2327
    const result = calcGrowthStat(610, 101, 18);
    expect(result).toBeCloseTo(2327, 0);
  });

  it("calculates correctly at level 6", () => {
    const result = calcGrowthStat(610, 101, 6);
    expect(result).toBeCloseTo(610 + 101 * 5 * 0.79, 0);
  });

  it("uses curved scaling (not linear)", () => {
    const linear = 610 + 101 * 8;
    const curved = calcGrowthStat(610, 101, 9);
    expect(curved).toBeLessThan(linear);
  });
});

describe("calcAttackSpeed", () => {
  it("returns base AS at level 1 with no bonus", () => {
    expect(calcAttackSpeed(0.625, 0.625, 1.0, 1, 0)).toBe(0.625);
  });

  it("caps at 2.5", () => {
    expect(calcAttackSpeed(0.625, 0.625, 1.0, 18, 500)).toBe(2.5);
  });

  it("increases with level", () => {
    const as1 = calcAttackSpeed(0.625, 0.625, 3.4, 1, 0);
    const as18 = calcAttackSpeed(0.625, 0.625, 3.4, 18, 0);
    expect(as18).toBeGreaterThan(as1);
  });

  it("increases with bonus AS", () => {
    const noBonus = calcAttackSpeed(0.625, 0.625, 1.0, 10, 0);
    const withBonus = calcAttackSpeed(0.625, 0.625, 1.0, 10, 50);
    expect(withBonus).toBeGreaterThan(noBonus);
  });
});

describe("calcChampionStats", () => {
  const jinxBase: ChampionBaseStats = {
    hp: 610,
    hpGrowth: 101,
    mp: 245,
    mpGrowth: 45,
    ad: 57,
    adGrowth: 3.4,
    armor: 26,
    armorGrowth: 4.7,
    mr: 30,
    mrGrowth: 1.3,
    attackSpeed: 0.625,
    attackSpeedRatio: 0.625,
    attackSpeedGrowth: 1.0,
    moveSpeed: 325,
    range: 525,
  };

  it("returns correct stats at level 1", () => {
    const stats = calcChampionStats(jinxBase, 1);
    expect(stats.hp).toBe(610);
    expect(stats.ad).toBe(57);
    expect(stats.armor).toBe(26);
    expect(stats.mr).toBe(30);
    expect(stats.critChance).toBe(0);
    expect(stats.critDamage).toBe(175);
  });

  it("returns correct stats at level 18", () => {
    const stats = calcChampionStats(jinxBase, 18);
    expect(stats.hp).toBeCloseTo(2327, 0);
    expect(stats.ad).toBeCloseTo(114.8, 0);
    expect(stats.range).toBe(525);
  });

  it("sets baseAd and bonusAd correctly (no items)", () => {
    const stats = calcChampionStats(jinxBase, 10);
    expect(stats.baseAd).toBe(stats.ad);
    expect(stats.bonusAd).toBe(0);
  });

  it("sets baseHp and bonusHp correctly (no items)", () => {
    const stats = calcChampionStats(jinxBase, 10);
    expect(stats.baseHp).toBe(stats.hp);
    expect(stats.bonusHp).toBe(0);
  });
});

describe("aggregateItemStats", () => {
  it("sums stats from multiple items", () => {
    const items: ItemStats[] = [
      { ad: 55, critChance: 20 },
      { ad: 40, attackSpeed: 25 },
      { critChance: 25 },
    ];
    const result = aggregateItemStats(items);
    expect(result.ad).toBe(95);
    expect(result.critChance).toBe(45);
    expect(result.attackSpeed).toBe(25);
  });

  it("returns empty object for no items", () => {
    const result = aggregateItemStats([]);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("ignores unknown keys", () => {
    const items = [{ ad: 10, unknownStat: 999 } as unknown as ItemStats];
    const result = aggregateItemStats(items);
    expect(result.ad).toBe(10);
    expect((result as Record<string, unknown>)["unknownStat"]).toBeUndefined();
  });
});

describe("mergeStats", () => {
  const garenBase: ChampionBaseStats = {
    hp: 690,
    hpGrowth: 98,
    mp: 0,
    mpGrowth: 0,
    ad: 66,
    adGrowth: 4.5,
    armor: 38,
    armorGrowth: 4.2,
    mr: 32,
    mrGrowth: 2.05,
    attackSpeed: 0.625,
    attackSpeedRatio: 0.625,
    attackSpeedGrowth: 3.65,
    moveSpeed: 340,
    range: 175,
  };

  it("adds item stats to champion stats", () => {
    const itemStats: ItemStats = { ad: 55, lethality: 18, abilityHaste: 20 };
    const merged = mergeStats(garenBase, 1, itemStats);
    expect(merged.ad).toBe(66 + 55);
    expect(merged.lethality).toBe(18);
    expect(merged.abilityHaste).toBe(20);
  });

  it("caps crit chance at 100", () => {
    const itemStats: ItemStats = { critChance: 150 };
    const merged = mergeStats(garenBase, 1, itemStats);
    expect(merged.critChance).toBe(100);
  });

  it("tracks baseAd and bonusAd separately", () => {
    const itemStats: ItemStats = { ad: 55 };
    const merged = mergeStats(garenBase, 1, itemStats);
    expect(merged.baseAd).toBe(66);
    expect(merged.bonusAd).toBe(55);
    expect(merged.ad).toBe(121);
  });

  it("tracks baseHp and bonusHp separately", () => {
    const itemStats: ItemStats = { hp: 400 };
    const merged = mergeStats(garenBase, 1, itemStats);
    expect(merged.baseHp).toBe(690);
    expect(merged.bonusHp).toBe(400);
    expect(merged.hp).toBe(1090);
  });

  it("applies moveSpeedPercent as a multiplier", () => {
    const itemStats: ItemStats = { moveSpeed: 25, moveSpeedPercent: 10 };
    const merged = mergeStats(garenBase, 1, itemStats);
    // (340 + 25) * 1.10 = 401.5
    expect(merged.moveSpeed).toBeCloseTo(401.5, 1);
  });

  it("handles omnivamp separately from lifeSteal", () => {
    const itemStats: ItemStats = { lifeSteal: 10, omnivamp: 8 };
    const merged = mergeStats(garenBase, 1, itemStats);
    expect(merged.lifeSteal).toBe(10);
    expect(merged.omnivamp).toBe(8);
  });
});
