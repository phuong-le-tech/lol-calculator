import { describe, it, expect } from "vitest";
import { applyPassives, getAllPassives } from "../src/items/passiveRegistry";
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
    it("unconditionally adds 40% crit damage", () => {
      const ctx = createCombatContext();
      ctx.stats.critChance = 20; // any amount of crit
      ctx.stats.critDamage = 175;
      const result = applyPassives("preCalculation", [3031], ctx);
      expect(result.stats.critDamage).toBe(215);
    });

    it("adds 40% even with 0% crit chance", () => {
      const ctx = createCombatContext();
      ctx.stats.critChance = 0;
      ctx.stats.critDamage = 175;
      const result = applyPassives("preCalculation", [3031], ctx);
      expect(result.stats.critDamage).toBe(215);
    });

    it("stacks additively with base crit damage", () => {
      const ctx = createCombatContext();
      ctx.stats.critDamage = 175;
      const result = applyPassives("preCalculation", [3031], ctx);
      // 175 + 40 = 215
      expect(result.stats.critDamage).toBe(215);
    });
  });

  describe("Blade of the Ruined King", () => {
    it("adds 5% current HP for ranged", () => {
      const ctx = createCombatContext({
        attacker: { level: 10, range: 525, attackType: "RANGED", abilityRanks: {} },
      });
      ctx.target.currentHP = 2000;
      const result = applyPassives("onAutoAttack", [3153], ctx);
      expect(result.bonusDamage).toBeCloseTo(100, 0); // 2000 * 0.05
    });

    it("adds 8% current HP for melee", () => {
      const ctx = createCombatContext({
        attacker: { level: 10, range: 175, attackType: "MELEE", abilityRanks: {} },
      });
      ctx.target.currentHP = 2000;
      const result = applyPassives("onAutoAttack", [3153], ctx);
      expect(result.bonusDamage).toBeCloseTo(160, 0); // 2000 * 0.08
    });
  });

  describe("Rabadon's Deathcap", () => {
    it("increases AP by 30%", () => {
      const ctx = createCombatContext();
      ctx.stats.ap = 200;
      const result = applyPassives("preCalculation", [3089], ctx);
      expect(result.stats.ap).toBe(260); // 200 * 1.30
    });
  });

  describe("Kraken Slayer", () => {
    it("averages bonus damage in DPS mode (autoAttackCount=0)", () => {
      const ctx = createCombatContext({
        autoAttackCount: 0,
        attacker: { level: 10, range: 175, attackType: "MELEE", abilityRanks: {} },
      });
      // At level 10: baseDamage = 150 + 50 * (9/17) ≈ 176.47
      // Target at full HP, so missingHPBonus = 1.0
      // Melee: no penalty
      // Averaged over 3 hits: ~58.82
      const result = applyPassives("onAutoAttack", [6672], ctx);
      expect(result.bonusDamage).toBeCloseTo(176.47 / 3, 0);
    });

    it("procs full damage on 3rd hit in combo mode", () => {
      const ctx = createCombatContext({
        autoAttackCount: 3,
        attacker: { level: 18, range: 175, attackType: "MELEE", abilityRanks: {} },
      });
      // At level 18: baseDamage = 200
      // Full HP target: missingHPBonus = 1.0
      const result = applyPassives("onAutoAttack", [6672], ctx);
      expect(result.bonusDamage).toBeCloseTo(200, 0);
    });

    it("does not proc on non-3rd hit in combo mode", () => {
      const ctx = createCombatContext({
        autoAttackCount: 2,
        attacker: { level: 18, range: 175, attackType: "MELEE", abilityRanks: {} },
      });
      const result = applyPassives("onAutoAttack", [6672], ctx);
      expect(result.bonusDamage).toBe(0);
    });

    it("applies ranged penalty (80% effectiveness)", () => {
      const ctx = createCombatContext({
        autoAttackCount: 3,
        attacker: { level: 18, range: 525, attackType: "RANGED", abilityRanks: {} },
      });
      const result = applyPassives("onAutoAttack", [6672], ctx);
      // 200 * 0.8 = 160
      expect(result.bonusDamage).toBeCloseTo(160, 0);
    });

    it("increases damage based on target missing HP", () => {
      const ctx = createCombatContext({
        autoAttackCount: 3,
        attacker: { level: 18, range: 175, attackType: "MELEE", abilityRanks: {} },
        target: { hp: 2000, currentHP: 1000, armor: 100, mr: 50 },
      });
      // 50% missing HP: bonus = 1 + 0.5 * 0.5 = 1.25
      // 200 * 1.25 = 250
      const result = applyPassives("onAutoAttack", [6672], ctx);
      expect(result.bonusDamage).toBeCloseTo(250, 0);
    });
  });

  describe("Lich Bane", () => {
    it("procs when ability was cast before auto", () => {
      const ctx = createCombatContext({ abilityCastBeforeAuto: true });
      ctx.stats.baseAd = 80;
      ctx.stats.ad = 180;
      ctx.stats.ap = 100;
      const result = applyPassives("onAutoAttack", [3100], ctx);
      // 80 * 0.75 + 100 * 0.4 = 60 + 40 = 100
      expect(result.bonusMagicDamage).toBeCloseTo(100, 0);
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
    it("has no active passive effect (Giant Slayer removed V14.10)", () => {
      const ctx = createCombatContext();
      ctx.stats.hp = 1500;
      ctx.target.hp = 3500;
      const result = applyPassives("preCalculation", [3036], ctx);
      // No damage multiplier bonus - Giant Slayer was removed
      expect(result.damageMultiplier).toBe(1);
    });
  });

  describe("Nashor's Tooth", () => {
    it("adds on-hit magic damage (15 + 15% AP)", () => {
      const ctx = createCombatContext();
      ctx.stats.ap = 100;
      const result = applyPassives("onAutoAttack", [3115], ctx);
      // 15 + 100 * 0.15 = 30
      expect(result.bonusMagicDamage).toBeCloseTo(30, 0);
    });
  });
});
