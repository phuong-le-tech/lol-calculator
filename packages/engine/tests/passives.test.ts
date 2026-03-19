import { describe, it, expect } from "vitest";
import { applyPassives, getAllPassives } from "../src/items/passiveRegistry";
import type { FinalStats } from "@lol-sim/types";
import { createCombatContext } from "./helpers";

// Import passives to register them (runs once at module load)
import "../src/items/passives";

describe("Item Passives", () => {
  it("registers all built-in passives", () => {
    const passives = getAllPassives();
    // 7 passives: IE, Kraken, BotRK, Rabadon's, LordDom, Nashor's, LichBane
    expect(passives.length).toBe(7);
  });

  describe("Infinity Edge", () => {
    it("sets crit damage to 215 when crit >= 60%", () => {
      const ctx = createCombatContext({ stats: { critChance: 60 } as FinalStats });
      ctx.stats.critChance = 60;
      const result = applyPassives("preCalculation", [3031], ctx);
      expect(result.stats.critDamage).toBe(215);
    });

    it("does not change crit damage when crit < 60%", () => {
      const ctx = createCombatContext();
      ctx.stats.critChance = 40;
      const result = applyPassives("preCalculation", [3031], ctx);
      expect(result.stats.critDamage).toBe(175);
    });
  });

  describe("Blade of the Ruined King", () => {
    it("adds 8% current HP for ranged", () => {
      const ctx = createCombatContext({
        attacker: { level: 10, range: 525, attackType: "RANGED", abilityRanks: {} },
      });
      ctx.target.currentHP = 2000;
      const result = applyPassives("onAutoAttack", [3153], ctx);
      expect(result.bonusDamage).toBeCloseTo(160, 0);
    });

    it("adds 12% current HP for melee", () => {
      const ctx = createCombatContext({
        attacker: { level: 10, range: 175, attackType: "MELEE", abilityRanks: {} },
      });
      ctx.target.currentHP = 2000;
      const result = applyPassives("onAutoAttack", [3153], ctx);
      expect(result.bonusDamage).toBeCloseTo(240, 0);
    });
  });

  describe("Rabadon's Deathcap", () => {
    it("increases AP by 35%", () => {
      const ctx = createCombatContext();
      ctx.stats.ap = 200;
      const result = applyPassives("preCalculation", [3089], ctx);
      expect(result.stats.ap).toBe(270);
    });
  });

  describe("Kraken Slayer", () => {
    it("averages bonus damage in DPS mode (autoAttackCount=0)", () => {
      const ctx = createCombatContext({ autoAttackCount: 0 });
      ctx.stats.bonusAd = 50;
      ctx.stats.ad = 120;
      const result = applyPassives("onAutoAttack", [6672], ctx);
      // (35 + 50 * 0.6) / 3 = (35 + 30) / 3 = 21.67
      expect(result.bonusDamage).toBeCloseTo(21.67, 1);
    });

    it("procs full damage on 3rd hit in combo mode", () => {
      const ctx = createCombatContext({ autoAttackCount: 3 });
      ctx.stats.bonusAd = 50;
      const result = applyPassives("onAutoAttack", [6672], ctx);
      // 35 + 50 * 0.6 = 65
      expect(result.bonusDamage).toBeCloseTo(65, 0);
    });

    it("does not proc on non-3rd hit in combo mode", () => {
      const ctx = createCombatContext({ autoAttackCount: 2 });
      ctx.stats.bonusAd = 50;
      const result = applyPassives("onAutoAttack", [6672], ctx);
      expect(result.bonusDamage).toBe(0);
    });
  });

  describe("Lich Bane", () => {
    it("procs when ability was cast before auto", () => {
      const ctx = createCombatContext({ abilityCastBeforeAuto: true });
      ctx.stats.baseAd = 80;
      ctx.stats.ad = 180;
      ctx.stats.ap = 100;
      const result = applyPassives("onAutoAttack", [3100], ctx);
      // 80 * 0.75 + 100 * 0.5 = 60 + 50 = 110
      expect(result.bonusMagicDamage).toBeCloseTo(110, 0);
    });

    it("does not proc when no ability was cast before auto", () => {
      const ctx = createCombatContext({ abilityCastBeforeAuto: false });
      ctx.stats.baseAd = 80;
      ctx.stats.ap = 100;
      const result = applyPassives("onAutoAttack", [3100], ctx);
      expect(result.bonusMagicDamage).toBe(0);
    });
  });

  describe("Lord Dominik's Regards", () => {
    it("sets damageMultiplier based on HP difference", () => {
      const ctx = createCombatContext();
      ctx.stats.hp = 1500;
      ctx.target.hp = 3500;
      const result = applyPassives("preCalculation", [3036], ctx);
      // HP diff = 2000, bonus = min(15, (2000/2000)*15) = 15%
      expect(result.damageMultiplier).toBeCloseTo(1.15, 2);
    });

    it("applies 1.0 multiplier when attacker has more HP", () => {
      const ctx = createCombatContext();
      ctx.stats.hp = 3000;
      ctx.target.hp = 2000;
      const result = applyPassives("preCalculation", [3036], ctx);
      expect(result.damageMultiplier).toBe(1);
    });

    it("caps at 15% bonus (1.15 multiplier)", () => {
      const ctx = createCombatContext();
      ctx.stats.hp = 1000;
      ctx.target.hp = 5000;
      const result = applyPassives("preCalculation", [3036], ctx);
      expect(result.damageMultiplier).toBeCloseTo(1.15, 2);
    });
  });

  describe("Nashor's Tooth", () => {
    it("adds on-hit magic damage", () => {
      const ctx = createCombatContext();
      ctx.stats.ap = 100;
      const result = applyPassives("onAutoAttack", [3115], ctx);
      expect(result.bonusMagicDamage).toBeCloseTo(35, 0);
    });
  });
});
